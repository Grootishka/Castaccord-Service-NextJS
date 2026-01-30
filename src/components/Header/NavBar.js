import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import "assets/scss/layout/Header/NavBar.scss";

const NavBar = () => {
	const router = useRouter();
	const { t, i18n } = useTranslation("common");
	const header = t("header", { returnObjects: true });

	const handleClick = (item) => {
		switch (item) {
			case header?.connectTwitch:
				router.push("/connect-twitch", null, { locale: i18n.language });
				break;
			case header?.importTokens:
				router.push("/import-tokens", null, { locale: i18n.language });
				break;
			case header?.chat:
				router.push("/chat", null, { locale: i18n.language });
				break;
			default:
				break;
		}
	};

	return (
		<div className="header-nav-bar">
			<div className="header-nav-bar-item" onClick={() => handleClick(header?.importTokens)}>
				<p className="header-nav-bar-item-text">{header?.importTokens || ""}</p>
			</div>
			<div className="header-nav-bar-item" onClick={() => handleClick(header?.chat)}>
				<p className="header-nav-bar-item-text">{header?.chat || ""}</p>
			</div>
		</div>
	);
};

export default NavBar;
