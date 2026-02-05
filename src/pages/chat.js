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
import useIRC from "hooks/useIRC";

import "assets/scss/ChatPage/main.scss";

const Chat = () => {
	const { t } = useTranslation("chatPage");
	const chat = t("content", { returnObjects: true });

	const { botAccounts, user } = useSelector((state) => state.main);

	const [isLoading, setIsLoading] = useState(false);
	const [isBotsCollapsed, setIsBotsCollapsed] = useState(false);
	const [isFeedCollapsed, setIsFeedCollapsed] = useState(false);
	const [botSearchQuery, setBotSearchQuery] = useState("");

	const [message, setMessage] = useState("");

	const [selectedBotId, setSelectedBotId] = useState(null);
	const isAutoMode = selectedBotId === null;

	const [autoSeed, setAutoSeed] = useState(1);

	const [chatType, setChatType] = useState("twitch");
	const [replyMode, setReplyMode] = useState(null);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);

	const channelName = "grootishka_"; // user?.broadcaster_username || "";
	const parentDomain = "localhost"; // "castaccord.com";

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
			filteredBots
				.filter((bot) => bot.status === "active")
				.map((bot) => {
					const title = bot.username || t("content.botFallbackName", { id: bot.id });

					let subtitle = "";
					subtitle = bot.status;

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
		if (isFeedCollapsed) {
			classes.push("chat-layout-feed-collapsed");
		}
		if (isBotsCollapsed) {
			classes.push("chat-layout-bots-collapsed");
		}
		return classes.join(" ");
	}, [isFeedCollapsed, isBotsCollapsed]);

	const sendingAsText = useMemo(() => {
		if (!effectiveBot) {
			return chat?.noBotSelected || "";
		}
		const name = effectiveBot.username || t("content.botFallbackName", { id: effectiveBot.id });
		return name;
	}, [effectiveBot, chat]);

	const hideBotsText = useMemo(() => {
		if (isBotsCollapsed) {
			return chat?.showBots;
		}
		return chat?.hideBots;
	}, [isBotsCollapsed, chat]);

	const focusTextArea = () => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
				}
			}, 10);
		});
	};

	const handleRestoreChat = useCallback(() => {
		setIsFeedCollapsed(false);
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
			}
		}, 200);
	}, []);

	const { isPopoutMode, openChatPopup, broadcastChannel } = usePopoutChat(handleRestoreChat);

	const { ircMessages, ircConnectionState, connectIRC } = useIRC(channelName, {
		broadcastChannel,
		chat,
	});

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
					}, 10);
				});
				return;
			}

			setReplyMode(null);
			setMessage("");

			if (!isAutoMode) {
				setSelectedBotId(null);
			}
			setAutoSeed((v) => v + 1);

			focusTextArea();
		} catch (e) {
			console.error("Error sending reply:", e);
			focusTextArea();
		} finally {
			setIsLoading(false);
		}
	};

	const sendMessage = async () => {
		try {
			if (!availableBots.length) {
				toast.error(chat?.botsNotImported);
				focusTextArea();
				return;
			}

			const text = (message || "").trim();
			if (!text) {
				if (!isAutoMode) {
					setSelectedBotId(null);
				}
				setAutoSeed((v) => v + 1);
				focusTextArea();
				return;
			}

			if (!effectiveBotId) {
				toast.error(chat?.noBotSelected);
				focusTextArea();
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
				focusTextArea();
				return;
			}

			setMessage("");

			if (!isAutoMode) {
				setSelectedBotId(null);
			}
			setAutoSeed((v) => v + 1);

			focusTextArea();
		} catch (e) {
			console.error("Error sending message:", e);
			focusTextArea();
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
				focusTextArea();
			}
		}
	};

	const sendPreparedMessage = async (text) => {
		const preparedText = (text || "").trim();
		if (!preparedText) {
			return;
		}

		try {
			if (!availableBots.length) {
				toast.error(chat?.botsNotImported);
				focusTextArea();
				return;
			}

			if (!effectiveBotId) {
				toast.error(chat?.noBotSelected);
				focusTextArea();
				return;
			}

			setIsLoading(true);

			const response = await fetchWithToken("/api/v1/messages", {
				method: "POST",
				body: {
					bot_account_id: effectiveBotId,
					broadcaster_username: channelName,
					message: preparedText,
				},
			});

			if (response && response.success === false) {
				toast.error(response.error || chat?.sendFailed);
				focusTextArea();
				return;
			}

			if (!isAutoMode) {
				setSelectedBotId(null);
			}
			setAutoSeed((v) => v + 1);

			focusTextArea();
		} catch (e) {
			console.error("Error sending prepared message:", e);
			focusTextArea();
		} finally {
			setIsLoading(false);
		}
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
			botUsername: effectiveBot.username || t("content.botFallbackName", { id: effectiveBotId }),
		});

		focusTextArea();
	};

	const onChatTypeChange = (type) => {
		if (type === "irc" && chatType !== "irc") {
			setChatType("irc");
			if (ircConnectionState === "disconnected") {
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

			if (type === "chat:state_sync" && data && data.chatType) {
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

	return (
		<div className="main-chat-block">
			<div className="chat-content-block">
				{!availableBots.length && <p className="chat-warning">{chat?.botsNotImported}</p>}

				<div className={layoutClassName}>
					{!isFeedCollapsed && (
						<ChatFeed
							chat={chat}
							chatType={chatType}
							onChatTypeChange={onChatTypeChange}
							channelName={channelName}
							parentDomain={parentDomain}
							ircMessages={ircMessages}
							ircConnectionState={ircConnectionState}
							onMessageClick={handleMessageClick}
							replyMode={replyMode}
							messagesEndRef={messagesEndRef}
							botUsernames={botUsernames}
							onOpenPopup={openChatPopup}
						/>
					)}

					<div className="chat-stream-block">
						<ChatStream channelName={channelName} parentDomain={parentDomain} />
						<ChatComposer chat={chat} message={message} setMessage={setMessage} onKeyDown={onKeyDown} sendingAsText={sendingAsText} replyMode={replyMode} setReplyMode={setReplyMode} isAutoMode={isAutoMode} textareaRef={textareaRef} onToggleBots={onToggleBots} hideBotsText={hideBotsText} onSendPreparedMessage={sendPreparedMessage} />
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
