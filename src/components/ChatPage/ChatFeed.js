import React from "react";
import PropTypes from "prop-types";
import IRCChat from "components/ChatPage/IRCChat";

import "assets/scss/ChatPage/ChatFeed.scss";

const ChatFeed = ({ chat, chatType, onChatTypeChange, channelName, parentDomain, ircMessages, ircConnectionState, onMessageClick, replyMode, messagesEndRef, botUsernames }) => (
	<div className="chat-feed-block">
		<div className="chat-panel-header">
			<p className="chat-panel-title">{chat?.feedTitle}</p>
			<div className="chat-type-switcher">
				<button className={["chat-type-button", chatType === "twitch" ? "chat-type-button-active" : ""].join(" ")} type="button" onClick={() => onChatTypeChange("twitch")}>
					{chat?.twitchChat}
				</button>
				<button className={["chat-type-button", chatType === "irc" ? "chat-type-button-active" : ""].join(" ")} type="button" onClick={() => onChatTypeChange("irc")}>
					{chat?.ircChat}
				</button>
			</div>
		</div>

		{chatType === "twitch" ? (
			<div className="chat-feed-frame-block">
				<iframe className="chat-feed-frame" src={`https://www.twitch.tv/embed/${channelName}/chat?parent=${parentDomain}`} title="twitch-chat" height="100%" width="100%" />
			</div>
		) : (
			<IRCChat messages={ircMessages} connectionState={ircConnectionState} onMessageClick={onMessageClick} replyMode={replyMode} messagesEndRef={messagesEndRef} chat={chat} botUsernames={botUsernames} />
		)}
	</div>
);

ChatFeed.propTypes = {
	chat: PropTypes.object.isRequired,
	chatType: PropTypes.oneOf(["twitch", "irc"]).isRequired,
	onChatTypeChange: PropTypes.func.isRequired,
	channelName: PropTypes.string.isRequired,
	parentDomain: PropTypes.string.isRequired,
	ircMessages: PropTypes.array.isRequired,
	ircConnectionState: PropTypes.string.isRequired,
	onMessageClick: PropTypes.func.isRequired,
	replyMode: PropTypes.object,
	messagesEndRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
	botUsernames: PropTypes.instanceOf(Set).isRequired,
};

ChatFeed.defaultProps = {
	replyMode: null,
	messagesEndRef: null,
};

export default ChatFeed;
