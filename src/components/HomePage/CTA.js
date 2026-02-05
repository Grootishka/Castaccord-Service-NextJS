import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";

const CTA = ({ content }) => {
	const router = useRouter();
	const { i18n } = useTranslation("homePage");

	const handleGetStarted = () => {
		router.push("/login", null, { locale: i18n.language });
	};

	return (
		<section className="home-cta">
			<div className="home-container">
				<div className="home-cta-content">
					<h2 className="home-cta-title">{content?.cta?.title}</h2>
					<p className="home-cta-subtitle">{content?.cta?.subtitle}</p>
					<button type="button" className="home-cta-button" onClick={handleGetStarted}>
						{content?.cta?.button}
					</button>
				</div>
			</div>
		</section>
	);
};

CTA.propTypes = {
	content: PropTypes.object.isRequired,
};

export default CTA;
