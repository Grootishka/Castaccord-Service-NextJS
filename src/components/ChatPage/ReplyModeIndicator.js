import React from "react";
import PropTypes from "prop-types";

import "assets/scss/ChatPage/ReplyModeIndicator.scss";

const ReplyModeIndicator = ({ replyMode, onCancel, chat }) => {
	if (!replyMode) return null;

	return (
		<div className="reply-mode-indicator">
			<span className="reply-mode-indicator-text">
				{chat?.replyingTo || ""} <strong>{replyMode.username}</strong> {chat?.fromBot || ""} <strong>{replyMode.botUsername}</strong>
			</span>
			<button className="reply-mode-indicator-cancel" type="button" onClick={onCancel} title={chat?.cancelReply || ""}>
				×
			</button>
		</div>
	);
};

ReplyModeIndicator.propTypes = {
	replyMode: PropTypes.shape({
		username: PropTypes.string,
		messageId: PropTypes.string,
		botId: PropTypes.number,
		botUsername: PropTypes.string,
	}),
	onCancel: PropTypes.func.isRequired,
	chat: PropTypes.object,
};

ReplyModeIndicator.defaultProps = {
	replyMode: null,
	chat: {},
};

export default ReplyModeIndicator;
