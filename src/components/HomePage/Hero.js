import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";

const Hero = ({ content }) => {
	const router = useRouter();
	const { i18n } = useTranslation("homePage");

	const handleGetStarted = () => {
		router.push("/login", null, { locale: i18n.language });
	};

	return (
		<section className="home-hero">
			<div className="home-hero-content">
				<h1 className="home-hero-title">{content?.hero?.title}</h1>
				<p className="home-hero-subtitle">{content?.hero?.subtitle}</p>
				<div className="home-hero-buttons">
					<button type="button" className="home-hero-button home-hero-button-primary" onClick={handleGetStarted}>
						{content?.hero?.ctaPrimary}
					</button>
					<button type="button" className="home-hero-button home-hero-button-secondary" onClick={() => router.push("/import-tokens", null, { locale: i18n.language })}>
						{content?.hero?.ctaSecondary}
					</button>
				</div>
			</div>
		</section>
	);
};

Hero.propTypes = {
	content: PropTypes.object.isRequired,
};

export default Hero;
