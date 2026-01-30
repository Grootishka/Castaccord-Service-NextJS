import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { withRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import fetchWithToken from "services/fetchWithToken";
import ChatFeed from "components/ChatPage/ChatFeed";
import ChatComposer from "components/ChatPage/ChatComposer";
import ChatBotsList from "components/ChatPage/ChatBotsList";
import ChatStream from "components/ChatPage/ChatStream";
import usePopoutChat from "hooks/usePopoutChat";
import TwitchIRC from "services/twitchIRC";

import "assets/scss/ChatPage/main.scss";

const Chat = () => {
	const { t } = useTranslation("chatPage");
	const chat = t("content", { returnObjects: true });

	const { botAccounts } = useSelector((state) => state.main);

	const [isLoading, setIsLoading] = useState(false);
	const [isBotsCollapsed, setIsBotsCollapsed] = useState(false);
	const [isFeedCollapsed, setIsFeedCollapsed] = useState(false);
	const [botSearchQuery, setBotSearchQuery] = useState("");

	const [message, setMessage] = useState("");

	// null => auto mode
	const [selectedBotId, setSelectedBotId] = useState(null);
	const isAutoMode = selectedBotId === null;

	// seed to rotate auto bot after send
	const [autoSeed, setAutoSeed] = useState(1);

	// Chat type: "twitch" or "irc"
	const [chatType, setChatType] = useState("twitch");

	const [ircMessages, setIrcMessages] = useState([]);
	const [ircConnectionState, setIrcConnectionState] = useState("disconnected");
	const [replyMode, setReplyMode] = useState(null);
	const ircClientRef = useRef(null);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);

	const channelName = "grootishka_";
	const parentDomain = "localhost";

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

	const activeBots = useMemo(() => {
		if (!availableBots.length) return [];
		const active = availableBots.filter((b) => b.status === "active");
		return active.length ? active : availableBots;
	}, [availableBots]);

	const botUsernames = useMemo(() => new Set(availableBots.map((bot) => bot.username?.toLowerCase()).filter(Boolean)), [availableBots]);

	const filteredBots = useMemo(() => {
		if (!botSearchQuery.trim()) return availableBots;
		const query = botSearchQuery.toLowerCase().trim();
		return availableBots.filter((bot) => {
			const username = bot.username?.toLowerCase() || "";
			const id = String(bot.id);
			return username.includes(query) || id.includes(query);
		});
	}, [availableBots, botSearchQuery]);

	const pickDeterministicBotId = (bots, seed) => {
		if (!bots.length) return null;
		const idx = Math.abs((seed * 9301 + 49297) % 233280) % bots.length;
		return bots[idx].id;
	};

	const autoBotId = useMemo(() => pickDeterministicBotId(activeBots, autoSeed), [activeBots, autoSeed]);

	const effectiveBotId = useMemo(() => (isAutoMode ? autoBotId : selectedBotId), [isAutoMode, autoBotId, selectedBotId]);

	const effectiveBot = useMemo(() => {
		if (!effectiveBotId) return null;
		return availableBots.find((b) => b.id === effectiveBotId) || null;
	}, [availableBots, effectiveBotId]);

	const botsViewModels = useMemo(
		() =>
			filteredBots.map((bot) => {
				const title = bot.username || `Bot #${bot.id}`;

				let subtitle = "";
				if (bot.status) {
					subtitle = bot.status;
				}

				const isSelectedManual = !isAutoMode && selectedBotId === bot.id;
				const isActiveStatus = bot.status === "active";
				const isDisabled = !isActiveStatus;
				const isCurrentSender = effectiveBotId === bot.id;
				const isHighlighted = isCurrentSender || isSelectedManual;

				return {
					id: bot.id,
					title,
					subtitle,
					isActiveStatus,
					isDisabled,
					isHighlighted,
					isSelectedManual,
					isCurrentSender,
				};
			}),
		[filteredBots, isAutoMode, selectedBotId, effectiveBotId]
	);

	const layoutClassName = useMemo(() => {
		const classes = ["chat-layout"];
		if (isFeedCollapsed) classes.push("chat-layout-feed-collapsed");
		if (isBotsCollapsed) classes.push("chat-layout-bots-collapsed");
		return classes.join(" ");
	}, [isFeedCollapsed, isBotsCollapsed]);

	const isSendDisabled = !availableBots.length || isLoading;

	const sendingAsText = useMemo(() => {
		if (!effectiveBot) return chat?.noBotSelected || "";
		const name = effectiveBot.username || `Bot #${effectiveBot.id}`;
		return name;
	}, [effectiveBot, chat]);

	const hideBotsText = useMemo(() => (isBotsCollapsed ? chat?.showBots : chat?.hideBots), [isBotsCollapsed, chat]);

	const handleRestoreChat = useCallback(() => {
		setIsFeedCollapsed(false);
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
			}
		}, 200);
	}, []);

	const { isPopoutMode, openChatPopup, broadcastChannel } = usePopoutChat(handleRestoreChat);

	const onToggleBots = () => setIsBotsCollapsed((v) => !v);

	const onSelectBot = (botId) => {
		setSelectedBotId(botId);
	};

	const sendReply = async (messageId, botId, replyMessage) => {
		try {
			if (!messageId) {
				toast.error(chat?.noMessageId);
				return;
			}

			if (!botId) {
				toast.error(chat?.noBotSelected);
				return;
			}

			const text = (replyMessage || "").trim();
			if (!text) {
				if (!isAutoMode) {
					setSelectedBotId(null);
				}
				setAutoSeed((v) => v + 1);
				return;
			}

			setIsLoading(true);

			const response = await fetchWithToken("/api/v1/messages/reply", {
				method: "POST",
				body: {
					bot_account_id: String(botId),
					message: text,
					broadcaster_username: channelName,
					reply_to_message_id: messageId,
				},
			});

			if (response && response.success === false) {
				toast.error(response.error || chat?.replyFailed);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					}, 50);
				});
				return;
			}

			setReplyMode(null);
			setMessage("");

			if (!isAutoMode) {
				setSelectedBotId(null);
			}
			setAutoSeed((v) => v + 1);

			requestAnimationFrame(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
				}
			});
		} catch (e) {
			console.error("Error sending reply:", e);
			toast.error(chat?.somethingWentWrong);
			requestAnimationFrame(() => {
				setTimeout(() => {
					if (textareaRef.current) {
						textareaRef.current.focus();
					}
				}, 50);
			});
		} finally {
			setIsLoading(false);
		}
	};

	const sendMessage = async () => {
		try {
			if (!availableBots.length) {
				toast.error(chat?.botsNotImported);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					}, 10);
				});
				return;
			}

			const text = (message || "").trim();
			if (!text) {
				if (!isAutoMode) {
					setSelectedBotId(null);
				}
				setAutoSeed((v) => v + 1);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					}, 10);
				});
				return;
			}

			if (!effectiveBotId) {
				toast.error(chat?.noBotSelected);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					}, 10);
				});
				return;
			}

			if (replyMode && replyMode.messageId) {
				await sendReply(replyMode.messageId, replyMode.botId, text);
				return;
			}

			setIsLoading(true);

			const response = await fetchWithToken("/api/v1/messages", {
				method: "POST",
				body: {
					bot_account_id: effectiveBotId,
					broadcaster_username: channelName,
					message: text,
				},
			});

			if (response && response.success === false) {
				toast.error(response.error || chat?.sendFailed);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					}, 50);
				});
				return;
			}

			setMessage("");

			if (!isAutoMode) {
				setSelectedBotId(null);
			}
			setAutoSeed((v) => v + 1);

			requestAnimationFrame(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
				}
			});
		} catch (e) {
			console.error(e);
			toast.error(chat?.somethingWentWrong || "");
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
				}
			}, 0);
		} finally {
			setIsLoading(false);
		}
	};

	const onKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();
			const wasFocused = document.activeElement === textareaRef.current;
			sendMessage();
			if (wasFocused) {
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					}, 10);
				});
			}
		}
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
			toast.error(chat?.ircConnectionError);
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

				if (broadcastChannel && broadcastChannel.readyState === "open") {
					try {
						broadcastChannel.postMessage({
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

	const handleMessageClick = (msg) => {
		if (!msg.messageId) {
			toast.error(chat?.noMessageId);
			return;
		}

		if (!effectiveBotId || !effectiveBot) {
			toast.error(chat?.noBotsAvailable);
			return;
		}

		setReplyMode({
			username: msg.username,
			messageId: msg.messageId,
			botId: effectiveBotId,
			botUsername: effectiveBot.username || `Bot #${effectiveBotId}`,
		});

		requestAnimationFrame(() => {
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
				}
			}, 50);
		});
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

		if (broadcastChannel && broadcastChannel.readyState === "open") {
			try {
				broadcastChannel.postMessage({
					type: "chat:state_sync",
					data: { chatType: type },
				});
			} catch (e) {
				console.error("Error posting message to broadcast channel:", e);
			}
		}
	};

	useEffect(() => {
		if (chatType === "irc" && messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [ircMessages, chatType]);

	useEffect(() => {
		if (!broadcastChannel) return;

		const handleMessage = (event) => {
			const { type, data } = event.data || {};

			if (type === "chat:new_message" && data && data.ircMessages) {
				const loadedMessages = data.ircMessages.map((msg) => ({
					...msg,
					timestamp: new Date(msg.timestamp),
				}));
				setIrcMessages(loadedMessages);
			} else if (type === "chat:state_sync" && data && data.chatType) {
				setChatType(data.chatType);
			}
		};

		broadcastChannel.addEventListener("message", handleMessage);

		return () => {
			broadcastChannel.removeEventListener("message", handleMessage);
		};
	}, [broadcastChannel]);

	useEffect(() => {
		if (isPopoutMode) {
			setIsFeedCollapsed(true);
		}
	}, [isPopoutMode]);

	useEffect(
		() => () => {
			disconnectIRC();
		},
		[]
	);

	return (
		<div className="main-chat-block">
			<div className="chat-content-block">
				{!availableBots.length && <p className="chat-warning">{chat?.botsNotImported}</p>}

				<div className={layoutClassName}>
					{!isFeedCollapsed && <ChatFeed chat={chat} chatType={chatType} onChatTypeChange={onChatTypeChange} channelName={channelName} parentDomain={parentDomain} ircMessages={ircMessages} ircConnectionState={ircConnectionState} onMessageClick={handleMessageClick} replyMode={replyMode} messagesEndRef={messagesEndRef} botUsernames={botUsernames} onOpenPopup={openChatPopup} />}

					<div className="chat-stream-block">
						<ChatStream channelName={channelName} parentDomain={parentDomain} />
						<ChatComposer chat={chat} message={message} setMessage={setMessage} onKeyDown={onKeyDown} sendMessage={sendMessage} isSendDisabled={isSendDisabled} sendingAsText={sendingAsText} replyMode={replyMode} setReplyMode={setReplyMode} isAutoMode={isAutoMode} textareaRef={textareaRef} onToggleBots={onToggleBots} hideBotsText={hideBotsText} />
					</div>

					{!isBotsCollapsed && <ChatBotsList chat={chat} botsViewModels={botsViewModels} botSearchQuery={botSearchQuery} setBotSearchQuery={setBotSearchQuery} onSelectBot={onSelectBot} activeBotsCount={activeBots.length} />}
				</div>
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

export default withRouter(Chat);
