import React from "react";
import { Container } from "reactstrap";
import { useTranslation } from "next-i18next";

import "assets/scss/layout/Footer.scss";

const Footer = () => {
	const { t } = useTranslation("homePage");
	const footer = t("footer", { returnObjects: true });

	return (
		<Container>
			<div className="main-footer"></div>
		</Container>
	);
};

export default Footer;
