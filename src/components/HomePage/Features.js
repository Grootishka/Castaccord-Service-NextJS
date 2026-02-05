import React from "react";
import PropTypes from "prop-types";

const Features = ({ content }) => {
	const features = content?.features || [];

	return (
		<section className="home-features">
			<div className="home-container">
				<h2 className="home-section-title">{content?.featuresTitle}</h2>
				<div className="home-features-grid">
					{features.map((feature, index) => (
						<div key={index} className="home-feature-card">
							<div className="home-feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d={feature.iconPath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<h3 className="home-feature-title">{feature.title}</h3>
							<p className="home-feature-description">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

Features.propTypes = {
	content: PropTypes.object.isRequired,
};

export default Features;
