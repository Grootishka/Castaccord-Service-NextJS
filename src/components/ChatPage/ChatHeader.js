import React from "react";
import PropTypes from "prop-types";

import "assets/scss/ChatPage/ChatHeader.scss";

const ChatHeader = ({ chat, onToggleFeed, onToggleBots, hideFeedText, hideBotsText }) => (
	<div className="chat-header">
		<div className="chat-header-left">
			<p className="chat-title">{chat?.title}</p>
			<p className="chat-description">{chat?.description}</p>
		</div>

		<div className="chat-header-right">
			<button className="chat-header-button" type="button" onClick={onToggleFeed}>
				{hideFeedText}
			</button>
			<button className="chat-header-button" type="button" onClick={onToggleBots}>
				{hideBotsText}
			</button>
		</div>
	</div>
);

ChatHeader.propTypes = {
	chat: PropTypes.object.isRequired,
	onToggleFeed: PropTypes.func.isRequired,
	onToggleBots: PropTypes.func.isRequired,
	hideFeedText: PropTypes.string.isRequired,
	hideBotsText: PropTypes.string.isRequired,
};

export default ChatHeader;
