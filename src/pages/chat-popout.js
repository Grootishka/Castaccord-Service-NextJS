import React, { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { withRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import ChatFeed from "components/ChatPage/ChatFeed";
import useIRC from "hooks/useIRC";

import "assets/scss/ChatPage/main.scss";
import "assets/scss/ChatPage/ChatFeed.scss";
import "assets/scss/ChatPage/ChatPopout.scss";

const CHANNEL_NAME = "chat_channel";

const ChatPopout = () => {
	const { botAccounts, user } = useSelector((state) => state.main);

	const [chatType, setChatType] = useState("twitch");
	const [replyMode, setReplyMode] = useState(null);
	const messagesEndRef = useRef(null);
	const [broadcastChannel, setBroadcastChannel] = useState(null);

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

	const { t } = useTranslation("chatPage");
	const chat = t("content", { returnObjects: true });

	const { ircMessages, ircConnectionState, connectIRC } = useIRC(channelName, {
		broadcastChannel,
		chat,
	});

	useEffect(() => {
		if (typeof window !== "undefined" && window.BroadcastChannel) {
			const channel = new BroadcastChannel(CHANNEL_NAME);
			setBroadcastChannel(channel);

			channel.onmessage = (event) => {
				const { type, data } = event.data || {};

				if (type === "chat:state_sync") {
					if (data && data.chatType) {
						setChatType(data.chatType);
					}
				}
			};

			return () => {
				channel.close();
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

			if (broadcastChannel && broadcastChannel.readyState === "open") {
				try {
					broadcastChannel.postMessage({ type: "chat:popout_closed" });
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

	const handleReturnToPage = () => {
		if (window.opener && !window.opener.closed) {
			try {
				window.opener.postMessage({ type: "chat:popout_closed" }, window.location.origin);
			} catch (e) {
				console.error("Error posting message to opener:", e);
			}
		}

		if (broadcastChannel && broadcastChannel.readyState === "open") {
			try {
				broadcastChannel.postMessage({ type: "chat:popout_closed" });
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

	return (
		<div className="chat-popout-container">
			<div className="chat-popout-content">
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
					onReturnToPage={handleReturnToPage}
				/>
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
