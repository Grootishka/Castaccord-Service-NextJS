import React from "react";
import PropTypes from "prop-types";
import IRCChat from "components/ChatPage/IRCChat";

import "assets/scss/ChatPage/ChatFeed.scss";

const ChatFeed = ({ chat, chatType, onChatTypeChange, channelName, parentDomain, ircMessages, ircConnectionState, onMessageClick, replyMode, messagesEndRef, botUsernames, onOpenPopup, onReturnToPage }) => (
	<div className="chat-feed-block">
		<div className="chat-panel-header">
			<p className="chat-panel-title">{chat?.feedTitle}</p>
			<div className="chat-panel-header-right">
				{onReturnToPage && (
					<button className="chat-return-button" type="button" onClick={onReturnToPage}>
						{chat?.returnToPage || ""}
					</button>
				)}
				{onOpenPopup && (
					<button className="chat-popup-button" type="button" onClick={onOpenPopup} title={chat?.openInPopup || ""}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 3h10v10H3V3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
							<path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" />
						</svg>
					</button>
				)}
				<div className="chat-type-switcher">
					<button className={["chat-type-button", chatType === "twitch" ? "chat-type-button-active" : ""].join(" ")} type="button" onClick={() => onChatTypeChange("twitch")}>
						{chat?.twitchChat}
					</button>
					<button className={["chat-type-button", chatType === "irc" ? "chat-type-button-active" : ""].join(" ")} type="button" onClick={() => onChatTypeChange("irc")}>
						{chat?.ircChat}
					</button>
				</div>
			</div>
		</div>

		<div className={["chat-feed-frame-block", chatType === "twitch" ? "chat-feed-frame-block-visible" : "chat-feed-frame-block-hidden"].join(" ")}>
			<iframe className="chat-feed-frame" src={`https://www.twitch.tv/embed/${channelName}/chat?parent=${parentDomain}`} title="twitch-chat" height="100%" width="100%" />
		</div>
		<div className={["chat-feed-irc-block", chatType === "irc" ? "chat-feed-irc-block-visible" : "chat-feed-irc-block-hidden"].join(" ")}>
			<IRCChat messages={ircMessages} connectionState={ircConnectionState} onMessageClick={onMessageClick} replyMode={replyMode} messagesEndRef={messagesEndRef} chat={chat} botUsernames={botUsernames} />
		</div>
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
	onOpenPopup: PropTypes.func,
	onReturnToPage: PropTypes.func,
};

ChatFeed.defaultProps = {
	replyMode: null,
	messagesEndRef: null,
	onReturnToPage: null,
};

export default ChatFeed;
