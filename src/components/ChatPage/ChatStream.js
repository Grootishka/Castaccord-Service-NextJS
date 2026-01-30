import React from "react";
import PropTypes from "prop-types";

import "assets/scss/ChatPage/ChatStream.scss";

const ChatStream = ({ channelName, parentDomain }) => (
	<div className="chat-stream-block">
		<div className="chat-stream-frame-block">
			<iframe className="chat-stream-frame" src={`https://player.twitch.tv/?channel=${channelName}&parent=${parentDomain}&muted=true`} title="twitch-stream" allowFullScreen={true} height="100%" width="100%" />
		</div>
	</div>
);

ChatStream.propTypes = {
	channelName: PropTypes.string.isRequired,
	parentDomain: PropTypes.string.isRequired,
};

export default ChatStream;
