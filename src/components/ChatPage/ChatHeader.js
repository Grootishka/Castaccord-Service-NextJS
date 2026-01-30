import React from "react";
import PropTypes from "prop-types";

import "assets/scss/ChatPage/ChatHeader.scss";

const ChatHeader = ({ chat }) => (
	<div className="chat-header">
		<div className="chat-header-left">
			<p className="chat-title">{chat?.title}</p>
			<p className="chat-description">{chat?.description}</p>
		</div>
	</div>
);

ChatHeader.propTypes = {
	chat: PropTypes.object.isRequired,
};

export default ChatHeader;
