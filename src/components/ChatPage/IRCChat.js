import React from "react";
import PropTypes from "prop-types";

import "assets/scss/ChatPage/IRCChat.scss";

const IRCChat = ({ messages, connectionState, onMessageClick, replyMode, messagesEndRef, chat, botUsernames }) => {
	const isBot = (username) => {
		if (!username) return false;
		const lowerUsername = username.toLowerCase();
		return botUsernames && botUsernames.has(lowerUsername);
	};

	return (
		<div className="irc-chat-block">
			<div className="irc-chat-messages">
				{connectionState === "connecting" && (
					<div className="irc-chat-status">
						<p>{chat?.ircConnecting || ""}</p>
					</div>
				)}
				{connectionState === "error" && (
					<div className="irc-chat-status irc-chat-status-error">
						<p>{chat?.ircError || ""}</p>
					</div>
				)}
				{connectionState === "disconnected" && messages.length === 0 && (
					<div className="irc-chat-status">
						<p>{chat?.ircNotConnected || ""}</p>
					</div>
				)}
				{messages.length === 0 && connectionState === "connected" && (
					<div className="irc-chat-status">
						<p>{chat?.noBotMessages || ""}</p>
					</div>
				)}
				{messages.map((msg) => {
					const isSelected = replyMode && replyMode.messageId === msg.messageId;
					const msgIsBot = isBot(msg.username);
					return (
						<button key={msg.id} type="button" className={["irc-chat-message", isSelected ? "irc-chat-message-selected" : ""].join(" ")} onClick={() => onMessageClick(msg)} title={chat?.clickToReply || ""}>
							<div className="irc-chat-message-header">
								<span className="irc-chat-message-username">{msg.username}</span>
								{msgIsBot ? <span className="irc-chat-message-badge irc-chat-message-badge-bot">{chat?.botBadge || ""}</span> : <span className="irc-chat-message-badge irc-chat-message-badge-user">{chat?.userBadge || ""}</span>}
								<span className="irc-chat-message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
							</div>
							<div className="irc-chat-message-text">{msg.message}</div>
						</button>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};

IRCChat.propTypes = {
	messages: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			username: PropTypes.string,
			message: PropTypes.string,
			timestamp: PropTypes.instanceOf(Date),
			messageId: PropTypes.string,
		})
	),
	connectionState: PropTypes.oneOf(["disconnected", "connecting", "connected", "error"]),
	onMessageClick: PropTypes.func.isRequired,
	replyMode: PropTypes.shape({
		username: PropTypes.string,
		messageId: PropTypes.string,
		botId: PropTypes.number,
		botUsername: PropTypes.string,
	}),
	messagesEndRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
	chat: PropTypes.object,
	botUsernames: PropTypes.instanceOf(Set),
};

IRCChat.defaultProps = {
	messages: [],
	connectionState: "disconnected",
	replyMode: null,
	messagesEndRef: null,
	chat: {},
	botUsernames: new Set(),
};

export default IRCChat;
