import React from "react";
import PropTypes from "prop-types";
import ReplyModeIndicator from "components/ChatPage/ReplyModeIndicator";
import PreparedMessages from "components/ChatPage/PreparedMessages";
import useStreamTimer from "hooks/useStreamTimer";
import ViewerIcon from "assets/img/icons/Viewer";

import "assets/scss/ChatPage/ChatComposer.scss";

const ChatComposer = ({ chat, message, setMessage, onKeyDown, sendingAsText, replyMode, setReplyMode, textareaRef, onToggleBots, hideBotsText, onSendPreparedMessage, channelName }) => {
	const { isLive, streamDuration, viewers } = useStreamTimer(channelName);

	return (
		<div className="chat-composer-block">
			<div className="chat-composer-top">
				<div className="chat-composer-left">
					<div className="chat-composer-bot">
						<p className="chat-composer-bot-label">{chat?.sendingAs}</p>
						<p className="chat-composer-bot-value">{sendingAsText}</p>
					</div>
					<ReplyModeIndicator replyMode={replyMode} onCancel={() => setReplyMode(null)} chat={chat} />
				</div>

				{isLive && (
					<div className="chat-composer-timer-wrapper">
						<div className="chat-composer-timer">
							<span className="chat-composer-timer-label">LIVE</span>
							<span className="chat-composer-timer-value">{streamDuration}</span>
						</div>
						{viewers !== null && (
							<div className="chat-composer-viewers">
								<ViewerIcon className="chat-composer-viewers-icon" width={14} height={14} />
								<span className="chat-composer-viewers-value">{viewers.toLocaleString()}</span>
							</div>
						)}
					</div>
				)}

				<div className="chat-composer-right">
					<button className="chat-composer-hide-bots-button" type="button" onClick={onToggleBots}>
						{hideBotsText}
					</button>
				</div>
			</div>
			<PreparedMessages setMessage={setMessage} textareaRef={textareaRef} onSendPreparedMessage={onSendPreparedMessage} />

			<textarea ref={textareaRef} className="chat-composer-textarea" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={onKeyDown} placeholder={replyMode ? chat?.replyPlaceholder : chat?.messagePlaceholder} spellCheck={false} />
		</div>
	);
};

ChatComposer.propTypes = {
	chat: PropTypes.object.isRequired,
	message: PropTypes.string.isRequired,
	setMessage: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func.isRequired,
	sendingAsText: PropTypes.string.isRequired,
	replyMode: PropTypes.object,
	setReplyMode: PropTypes.func.isRequired,
	textareaRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
	onToggleBots: PropTypes.func.isRequired,
	hideBotsText: PropTypes.string.isRequired,
	onSendPreparedMessage: PropTypes.func.isRequired,
	channelName: PropTypes.string,
};

ChatComposer.defaultProps = {
	replyMode: null,
};

export default ChatComposer;
