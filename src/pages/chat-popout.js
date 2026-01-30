import React, { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { withRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import ChatFeed from "components/ChatPage/ChatFeed";
import TwitchIRC from "services/twitchIRC";

import "assets/scss/ChatPage/main.scss";
import "assets/scss/ChatPage/ChatFeed.scss";
import "assets/scss/ChatPage/ChatPopout.scss";

const CHANNEL_NAME = "chat_channel";

const ChatPopout = () => {
	const { t } = useTranslation("chatPage");
	const chat = t("content", { returnObjects: true });

	const { botAccounts, user } = useSelector((state) => state.main);

	const [chatType, setChatType] = useState("twitch");
	const [ircMessages, setIrcMessages] = useState([]);
	const [ircConnectionState, setIrcConnectionState] = useState("disconnected");
	const [replyMode, setReplyMode] = useState(null);
	const ircClientRef = useRef(null);
	const messagesEndRef = useRef(null);
	const broadcastChannelRef = useRef(null);

	const channelName = user?.broadcaster_username || "";
	const parentDomain = "castaccord.com";

	const availableBots = useMemo(() => {
		const list = Array.isArray(botAccounts) ? botAccounts : [];
		return list
			.map((item) => {
				const attrs = item?.attributes || {};
				return {
					id: Number(attrs.id),
					username: attrs.username,
					status: attrs.status,
					token: attrs.token || null,
				};
			})
			.filter((b) => Number.isFinite(b.id));
	}, [botAccounts]);

	const botUsernames = useMemo(() => new Set(availableBots.map((bot) => bot.username?.toLowerCase()).filter(Boolean)), [availableBots]);

	useEffect(() => {
		if (typeof window !== "undefined" && window.BroadcastChannel) {
			broadcastChannelRef.current = new BroadcastChannel(CHANNEL_NAME);

			broadcastChannelRef.current.onmessage = (event) => {
				const { type, data } = event.data || {};

				if (type === "chat:new_message") {
					if (data && data.ircMessages) {
						setIrcMessages(data.ircMessages);
					}
				} else if (type === "chat:state_sync") {
					if (data && data.ircMessages) {
						const loadedMessages = data.ircMessages.map((msg) => ({
							...msg,
							timestamp: new Date(msg.timestamp),
						}));
						setIrcMessages(loadedMessages);
					}
					if (data && data.chatType) {
						setChatType(data.chatType);
					}
				}
			};

			return () => {
				if (broadcastChannelRef.current) {
					broadcastChannelRef.current.close();
				}
			};
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleBeforeUnload = () => {
			if (window.opener && !window.opener.closed) {
				try {
					window.opener.postMessage({ type: "chat:popout_closed" }, window.location.origin);
				} catch (e) {
					console.error("Error posting message to opener:", e);
				}
			}

			if (broadcastChannelRef.current && broadcastChannelRef.current.readyState === "open") {
				try {
					broadcastChannelRef.current.postMessage({ type: "chat:popout_closed" });
				} catch (e) {
					console.error("Error posting message to broadcast channel:", e);
				}
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	const handleMessageClick = (msg) => {
		if (!msg.messageId) {
			toast.error(chat?.noMessageId || "");
			return;
		}
		setReplyMode({
			username: msg.username,
			messageId: msg.messageId,
		});
	};

	const connectIRC = () => {
		if (typeof window === "undefined") {
			return;
		}

		if (ircClientRef.current && ircConnectionState === "connected") {
			return;
		}

		if (ircClientRef.current) {
			ircClientRef.current.disconnect();
		}

		const ircClient = new TwitchIRC(channelName);
		ircClientRef.current = ircClient;

		ircClient.setOnConnect(() => {
			setIrcConnectionState("connected");
			if (typeof window !== "undefined") {
				try {
					const saved = localStorage.getItem("irc_messages");
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
			}
		});

		ircClient.setOnDisconnect(() => {
			setIrcConnectionState("disconnected");
		});

		ircClient.setOnError((error) => {
			console.error("IRC Error:", error);
			setIrcConnectionState("error");
			toast.error(chat?.ircConnectionError || "");
		});

		ircClient.onMessage((ircMessage) => {
			setIrcMessages((prev) => {
				const newMessage = {
					id: ircMessage.messageId || `msg_${Date.now()}_${Math.random()}`,
					username: ircMessage.username,
					message: ircMessage.message,
					timestamp: ircMessage.timestamp,
					messageId: ircMessage.messageId,
					userId: ircMessage.userId,
				};
				const updated = [...prev, newMessage].slice(-20);
				if (typeof window !== "undefined") {
					try {
						const toSave = updated.slice(-20).map((msg) => ({
							...msg,
							timestamp: msg.timestamp.toISOString(),
						}));
						localStorage.setItem("irc_messages", JSON.stringify(toSave));
					} catch (e) {
						console.error("Error saving IRC messages to localStorage:", e);
					}
				}

				if (broadcastChannelRef.current && broadcastChannelRef.current.readyState === "open") {
					try {
						broadcastChannelRef.current.postMessage({
							type: "chat:new_message",
							data: {
								ircMessages: updated.map((msg) => ({
									...msg,
									timestamp: msg.timestamp.toISOString(),
								})),
							},
						});
					} catch (e) {
						console.error("Error posting message to broadcast channel:", e);
					}
				}

				return updated;
			});
		});

		setIrcConnectionState("connecting");
		ircClient.connect();
	};

	const disconnectIRC = () => {
		if (ircClientRef.current) {
			ircClientRef.current.disconnect();
			ircClientRef.current = null;
		}
		setIrcConnectionState("disconnected");
	};

	const onChatTypeChange = (type) => {
		if (type === "irc" && chatType !== "irc") {
			setChatType("irc");
			if (typeof window !== "undefined" && (!ircClientRef.current || ircConnectionState === "disconnected")) {
				connectIRC();
			}
		} else if (type === "twitch" && chatType !== "twitch") {
			setChatType("twitch");
		}

		if (broadcastChannelRef.current && broadcastChannelRef.current.readyState === "open") {
			try {
				broadcastChannelRef.current.postMessage({
					type: "chat:state_sync",
					data: { chatType: type },
				});
			} catch (e) {
				console.error("Error posting message to broadcast channel:", e);
			}
		}
	};

	const handleReturnToPage = () => {
		if (window.opener && !window.opener.closed) {
			try {
				window.opener.postMessage({ type: "chat:popout_closed" }, window.location.origin);
			} catch (e) {
				console.error("Error posting message to opener:", e);
			}
		}

		if (broadcastChannelRef.current && broadcastChannelRef.current.readyState === "open") {
			try {
				broadcastChannelRef.current.postMessage({ type: "chat:popout_closed" });
			} catch (e) {
				console.error("Error posting message to broadcast channel:", e);
			}
		}

		window.close();
	};

	useEffect(() => {
		if (chatType === "irc" && messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [ircMessages, chatType]);

	useEffect(
		() => () => {
			disconnectIRC();
		},
		[]
	);

	return (
		<div className="chat-popout-container">
			<div className="chat-popout-content">
				<ChatFeed chat={chat} chatType={chatType} onChatTypeChange={onChatTypeChange} channelName={channelName} parentDomain={parentDomain} ircMessages={ircMessages} ircConnectionState={ircConnectionState} onMessageClick={handleMessageClick} replyMode={replyMode} messagesEndRef={messagesEndRef} botUsernames={botUsernames} onReturnToPage={handleReturnToPage} />
			</div>
		</div>
	);
};

export const getServerSideProps = withSSRRedirect(async (param) => {
	const { locale, resolvedUrl } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["common", "chatPage"])),
			locale,
			...getSEOOptions(resolvedUrl),
		},
	};
});

export default withRouter(ChatPopout);
