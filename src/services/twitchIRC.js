const WS_URL = "wss://irc-ws.chat.twitch.tv:443";

function randJustinfan() {
	return `justinfan${Math.floor(10000 + Math.random() * 90000)}`;
}

function parsePrivmsg(line) {
	// Example:
	// @tags :user!user@user.tmi.twitch.tv PRIVMSG #channel :message text
	const m = line.match(/^(?:@([^ ]+) )?:(\w+)![^ ]+ PRIVMSG #([^ ]+) :(.*)$/);
	if (!m) return null;

	const tagsStr = m[1] || "";
	const tags = {};
	if (tagsStr) {
		tagsStr.split(";").forEach((tag) => {
			const [key, value] = tag.split("=");
			if (key) {
				tags[key] = value || "";
			}
		});
	}

	return {
		user: m[2],
		channel: m[3],
		text: m[4],
		tags,
	};
}

export default class TwitchIRC {
	constructor(channel) {
		this.channel = channel.toLowerCase().replace("#", "");
		this.ws = null;
		this.isConnected = false;
		this.stopped = false;
		this.buffer = "";
		this.messageListeners = [];
		this.onConnectCallback = null;
		this.onDisconnectCallback = null;
		this.onErrorCallback = null;
		this.reconnectTimeout = null;
		this.reconnectMs = 3000;
	}

	connect = () => {
		if (this.ws && this.isConnected) {
			return;
		}

		// Only run on client side
		if (typeof window === "undefined") {
			console.warn("TwitchIRC: Cannot connect on server side");
			return;
		}

		if (this.stopped) return;

		try {
			this.ws = new WebSocket(WS_URL);

			this.ws.onopen = () => {
				console.log(`TwitchIRC: Connected to ${WS_URL}`);
				this.isConnected = true;

				// Anonymous connection (no token needed)
				const nick = randJustinfan();
				this.send("PASS SCHMOOPIIE");
				this.send(`NICK ${nick}`);

				// Request capabilities for tags and commands
				this.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");

				this.send(`JOIN #${this.channel}`);
				console.log(`TwitchIRC: Joined #${this.channel}`);

				if (this.onConnectCallback) {
					this.onConnectCallback();
				}
			};

			this.ws.onmessage = (event) => {
				this.buffer += event.data;

				let idx = this.buffer.indexOf("\r\n");
				while (idx >= 0) {
					const line = this.buffer.slice(0, idx);
					this.buffer = this.buffer.slice(idx + 2);

					if (line.startsWith("PING")) {
						// MUST reply or Twitch disconnects
						this.send(line.replace("PING", "PONG"));
					} else {
						const msg = parsePrivmsg(line);
						if (msg && msg.channel.toLowerCase() === this.channel) {
							const username = msg.user;
							const message = msg.text;
							const messageId = msg.tags.id || null;
							const userId = msg.tags["user-id"] || null;
							const timestamp = msg.tags["tmi-sent-ts"] ? new Date(parseInt(msg.tags["tmi-sent-ts"], 10)) : new Date();

							// Notify all listeners
							this.messageListeners.forEach((listener) => {
								listener({
									username,
									message,
									timestamp,
									messageId,
									userId,
									channel: this.channel,
									tags: msg.tags,
									raw: { line, msg },
								});
							});
						}
					}

					idx = this.buffer.indexOf("\r\n");
				}
			};
			this.ws.onclose = (event) => {
				console.log(`TwitchIRC: Disconnected code=${event.code} reason=${event.reason || ""}`);
				this.isConnected = false;
				this.ws = null;

				if (this.onDisconnectCallback) {
					this.onDisconnectCallback({ code: event.code, reason: event.reason });
				}

				// Auto-reconnect if not stopped
				if (!this.stopped) {
					this.reconnectTimeout = setTimeout(() => {
						this.connect();
					}, this.reconnectMs);
				}
			};

			this.ws.onerror = (error) => {
				console.error("TwitchIRC: WebSocket error", error);
				if (this.onErrorCallback) {
					this.onErrorCallback(error);
				}
			};
		} catch (error) {
			console.error("TwitchIRC: Error creating WebSocket", error);
			if (this.onErrorCallback) {
				this.onErrorCallback(error);
			}
		}
	};

	send = (line) => {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(`${line}\r\n`);
		}
	};

	onMessage = (callback) => {
		this.messageListeners.push(callback);
		return () => {
			const index = this.messageListeners.indexOf(callback);
			if (index > -1) {
				this.messageListeners.splice(index, 1);
			}
		};
	};

	setOnConnect = (callback) => {
		this.onConnectCallback = callback;
	};

	setOnDisconnect = (callback) => {
		this.onDisconnectCallback = callback;
	};

	setOnError = (callback) => {
		this.onErrorCallback = callback;
	};

	disconnect = () => {
		this.stopped = true;
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
		if (this.ws) {
			try {
				this.ws.close();
			} catch (e) {
				// Ignore errors on close
			}
			this.ws = null;
		}
		this.isConnected = false;
		this.messageListeners = [];
	};

	getConnectionState = () => {
		if (!this.ws) return "disconnected";
		if (this.isConnected) return "connected";
		return "connecting";
	};
}
