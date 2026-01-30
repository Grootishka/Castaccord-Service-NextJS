import React from "react";
import PropTypes from "prop-types";
import ReplyModeIndicator from "components/ChatPage/ReplyModeIndicator";

import "assets/scss/ChatPage/ChatComposer.scss";

const ChatComposer = ({ chat, message, setMessage, onKeyDown, sendMessage, isSendDisabled, sendingAsText, replyMode, setReplyMode, isAutoMode, textareaRef, onToggleBots, hideBotsText }) => (
	<div className="chat-composer-block">
		<div className="chat-composer-top">
			<div className="chat-composer-left">
				<div className="chat-composer-bot">
					<p className="chat-composer-bot-label">{chat?.sendingAs}</p>
					<p className="chat-composer-bot-value">{sendingAsText}</p>
				</div>
				<ReplyModeIndicator replyMode={replyMode} onCancel={() => setReplyMode(null)} chat={chat} />
			</div>

			<div className="chat-composer-right">
				<div className="chat-composer-mode">{isAutoMode ? chat?.autoMode : chat?.manualMode}</div>
				<button className="chat-composer-hide-bots-button" type="button" onClick={onToggleBots}>
					{hideBotsText}
				</button>
			</div>
		</div>

		<textarea ref={textareaRef} className="chat-composer-textarea" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={onKeyDown} placeholder={replyMode ? chat?.replyPlaceholder : chat?.messagePlaceholder} disabled={isSendDisabled} spellCheck={false} />
	</div>
);

ChatComposer.propTypes = {
	chat: PropTypes.object.isRequired,
	message: PropTypes.string.isRequired,
	setMessage: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func.isRequired,
	sendMessage: PropTypes.func.isRequired,
	isSendDisabled: PropTypes.bool.isRequired,
	sendingAsText: PropTypes.string.isRequired,
	replyMode: PropTypes.object,
	setReplyMode: PropTypes.func.isRequired,
	isAutoMode: PropTypes.bool.isRequired,
	textareaRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
	onToggleBots: PropTypes.func.isRequired,
	hideBotsText: PropTypes.string.isRequired,
};

ChatComposer.defaultProps = {
	replyMode: null,
};

export default ChatComposer;
