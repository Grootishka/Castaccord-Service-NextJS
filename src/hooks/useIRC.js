import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import TwitchIRC from "services/twitchIRC";

const STORAGE_KEY_PREFIX = "irc_messages_";
const MAX_MESSAGES = 20;

const useIRC = (channelName, options = {}) => {
	const { onError, chat } = options;
	const [ircMessages, setIrcMessages] = useState([]);
	const [ircConnectionState, setIrcConnectionState] = useState("disconnected");
	const ircClientRef = useRef(null);
	const broadcastChannelRef = useRef(options.broadcastChannel || null);
	const channelNameRef = useRef(channelName);

	useEffect(() => {
		channelNameRef.current = channelName;
	}, [channelName]);

	const getStorageKey = useCallback(() => {
		if (!channelNameRef.current) return `${STORAGE_KEY_PREFIX}default`;
		return `${STORAGE_KEY_PREFIX}${channelNameRef.current.toLowerCase().replace("#", "")}`;
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const storageKey = getStorageKey();
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				const parsed = JSON.parse(saved);
				const loadedMessages = parsed.map((msg) => ({
					...msg,
					timestamp: new Date(msg.timestamp),
				}));
				setIrcMessages(loadedMessages);
			}
		} catch (e) {
			console.error("Error loading IRC messages from localStorage:", e);
		}
	}, [getStorageKey]);

	const saveMessagesToStorage = useCallback(
		(messages) => {
			if (typeof window === "undefined") return;

			try {
				const storageKey = getStorageKey();
				const toSave = messages.slice(-MAX_MESSAGES).map((msg) => ({
					...msg,
					timestamp: msg.timestamp.toISOString(),
				}));
				localStorage.setItem(storageKey, JSON.stringify(toSave));
			} catch (e) {
				console.error("Error saving IRC messages to localStorage:", e);
			}
		},
		[getStorageKey]
	);

	const broadcastMessages = useCallback((messages) => {
		if (!broadcastChannelRef.current || broadcastChannelRef.current.readyState !== "open") {
			return;
		}

		try {
			broadcastChannelRef.current.postMessage({
				type: "chat:new_message",
				data: {
					channelName: channelNameRef.current,
					ircMessages: messages.slice(-MAX_MESSAGES).map((msg) => ({
						...msg,
						timestamp: msg.timestamp.toISOString(),
					})),
				},
			});
		} catch (e) {
			console.error("Error posting message to broadcast channel:", e);
		}
	}, []);

	const handleIRCMessage = useCallback(
		(ircMessage) => {
			setIrcMessages((prev) => {
				const newMessage = {
					id: ircMessage.messageId || `msg_${Date.now()}_${Math.random()}`,
					username: ircMessage.username,
					message: ircMessage.message,
					timestamp: ircMessage.timestamp,
					messageId: ircMessage.messageId,
					userId: ircMessage.userId,
				};
				const updated = [...prev, newMessage].slice(-MAX_MESSAGES);

				saveMessagesToStorage(updated);
				broadcastMessages(updated);

				return updated;
			});
		},
		[saveMessagesToStorage, broadcastMessages]
	);

	const connectIRC = useCallback(() => {
		if (typeof window === "undefined") {
			return;
		}

		if (ircClientRef.current && ircConnectionState === "connected") {
			return;
		}

		if (ircClientRef.current) {
			ircClientRef.current.disconnect();
		}

		if (!channelName) {
			console.warn("Cannot connect to IRC: channelName is required");
			return;
		}

		const ircClient = new TwitchIRC(channelName);
		ircClientRef.current = ircClient;

		ircClient.setOnConnect(() => {
			setIrcConnectionState("connected");
		});

		ircClient.setOnDisconnect(() => {
			setIrcConnectionState("disconnected");
		});

		ircClient.setOnError((error) => {
			console.error("IRC Error:", error);
			setIrcConnectionState("error");
			if (onError) {
				onError(error);
			} else if (chat?.ircConnectionError) {
				toast.error(chat.ircConnectionError);
			}
		});

		ircClient.onMessage(handleIRCMessage);

		setIrcConnectionState("connecting");
		ircClient.connect();
	}, [channelName, ircConnectionState, handleIRCMessage, onError, chat]);

	const disconnectIRC = useCallback(() => {
		if (ircClientRef.current) {
			ircClientRef.current.disconnect();
			ircClientRef.current = null;
		}
		setIrcConnectionState("disconnected");
	}, []);

	useEffect(() => {
		const channel = options.broadcastChannel;
		if (channel) {
			broadcastChannelRef.current = channel;
		}
	}, [options.broadcastChannel]);

	useEffect(() => {
		const channel = broadcastChannelRef.current;
		if (!channel) return;

		const handleMessage = (event) => {
			const { type, data } = event.data || {};

			if (type === "chat:new_message" && data && data.ircMessages && data.channelName === channelNameRef.current) {
				const loadedMessages = data.ircMessages.map((msg) => ({
					...msg,
					timestamp: new Date(msg.timestamp),
				}));
				setIrcMessages(loadedMessages);
			}
		};

		channel.addEventListener("message", handleMessage);

		return () => {
			channel?.removeEventListener("message", handleMessage);
		};
	}, [options.broadcastChannel]);

	useEffect(
		() => () => {
			disconnectIRC();
		},
		[disconnectIRC]
	);

	return {
		ircMessages,
		ircConnectionState,
		connectIRC,
		disconnectIRC,
	};
};

export default useIRC;
