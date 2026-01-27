import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import "assets/scss/layout/Header/NavBar.scss";

const NavBar = () => {
	const router = useRouter();
	const { t } = useTranslation("common");
	const header = t("header", { returnObjects: true });

	const { twitchAccount } = useSelector((state) => state.main);

	const handleClick = (item) => {
		switch (item) {
			case header?.connectTwitch:
				router.push("/connect-twitch");
				break;
			case header?.importTokens:
				router.push("/import-tokens");
				break;
			case header?.bots:
				router.push("/bots");
				break;
			case header?.chat:
				router.push("/chat");
				break;
			default:
				break;
		}
	};

	return (
		<div className="header-nav-bar">
			{!twitchAccount && (
				<div className="header-nav-bar-item" onClick={() => handleClick(header?.connectTwitch)}>
					<p className="header-nav-bar-item-text">{header?.connectTwitch || ""}</p>
				</div>
			)}
			<div className="header-nav-bar-item" onClick={() => handleClick(header?.importTokens)}>
				<p className="header-nav-bar-item-text">{header?.importTokens || ""}</p>
			</div>
			<div className="header-nav-bar-item" onClick={() => handleClick(header?.bots)}>
				<p className="header-nav-bar-item-text">{header?.bots || ""}</p>
			</div>
			<div className="header-nav-bar-item" onClick={() => handleClick(header?.chat)}>
				<p className="header-nav-bar-item-text">{header?.chat || ""}</p>
			</div>
		</div>
	);
};

export default NavBar;
