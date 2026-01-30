import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import "assets/scss/ChatPage/ChatBotsList.scss";

const ChatBotsList = ({ chat, botsViewModels, botSearchQuery, setBotSearchQuery, onSelectBot, activeBotsCount }) => {
	const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
	const placeholderText = chat?.searchBotsByName || chat?.searchBots || "";

	useEffect(() => {
		if (!botSearchQuery && placeholderText) {
			let currentIndex = 0;
			let timeoutId = null;

			const animate = () => {
				if (currentIndex <= placeholderText.length) {
					setAnimatedPlaceholder(placeholderText.slice(0, currentIndex));
					currentIndex++;
					timeoutId = setTimeout(animate, 100);
				} else {
					timeoutId = setTimeout(() => {
						setAnimatedPlaceholder("");
						currentIndex = 0;
						animate();
					}, 2000);
				}
			};

			animate();

			return () => {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			};
		}
		setAnimatedPlaceholder("");
	}, [botSearchQuery, placeholderText]);

	return (
		<div className="chat-bots-block">
			<div className="chat-panel-header">
				<div className="chat-panel-title-wrapper">
					<p className="chat-panel-title">{chat?.botsTitle || ""}</p>
					{activeBotsCount > 0 && <span className="chat-panel-title-count">({activeBotsCount})</span>}
				</div>
			</div>

			<div className="chat-bots-search">
				<input type="text" className="chat-bots-search-input" placeholder={botSearchQuery ? "" : animatedPlaceholder} value={botSearchQuery} onChange={(e) => setBotSearchQuery(e.target.value)} />
			</div>

			<div className="chat-bots-list">
				{!botsViewModels.length && <p className="chat-bots-empty">{chat?.botsEmpty}</p>}

				{botsViewModels.map((vm) => (
					<button key={vm.id} className={["chat-bot-item", vm.isHighlighted ? "chat-bot-item-selected" : "", vm.isDisabled ? "chat-bot-item-disabled" : ""].join(" ")} type="button" onClick={() => onSelectBot(vm.id)} disabled={vm.isDisabled}>
						<div className="chat-bot-item-left">
							<div className={["chat-bot-status", vm.isActiveStatus ? "chat-bot-status-active" : ""].join(" ")} />
							<div className="chat-bot-text">
								<p className="chat-bot-title">{vm.title}</p>
							</div>
						</div>

						<div className="chat-bot-right">
							{!!vm.subtitle && !vm.isCurrentSender && <p className={["chat-bot-badge", `chat-bot-badge-${vm.subtitle}`].join(" ")}>{vm.subtitle}</p>}
							{vm.isCurrentSender && <p className="chat-bot-picked">{chat?.activeBot}</p>}
							{vm.isSelectedManual && !vm.isCurrentSender && <p className="chat-bot-picked">{chat?.picked}</p>}
						</div>
					</button>
				))}
			</div>
		</div>
	);
};

ChatBotsList.propTypes = {
	chat: PropTypes.object.isRequired,
	botsViewModels: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			title: PropTypes.string.isRequired,
			subtitle: PropTypes.string,
			isActiveStatus: PropTypes.bool.isRequired,
			isDisabled: PropTypes.bool.isRequired,
			isHighlighted: PropTypes.bool.isRequired,
			isSelectedManual: PropTypes.bool.isRequired,
			isCurrentSender: PropTypes.bool.isRequired,
		})
	).isRequired,
	botSearchQuery: PropTypes.string.isRequired,
	setBotSearchQuery: PropTypes.func.isRequired,
	onSelectBot: PropTypes.func.isRequired,
	activeBotsCount: PropTypes.number.isRequired,
};

export default ChatBotsList;
