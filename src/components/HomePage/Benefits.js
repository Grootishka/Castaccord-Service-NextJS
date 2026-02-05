import React from "react";
import PropTypes from "prop-types";

const Benefits = ({ content }) => {
	const benefits = content?.benefits || [];

	return (
		<section className="home-benefits">
			<div className="home-container">
				<h2 className="home-section-title">{content?.benefitsTitle}</h2>
				<div className="home-benefits-list">
					{benefits.map((benefit, index) => (
						<div key={index} className="home-benefit-item">
							<div className="home-benefit-number">{index + 1}</div>
							<div className="home-benefit-content">
								<h3 className="home-benefit-title">{benefit.title}</h3>
								<p className="home-benefit-description">{benefit.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

Benefits.propTypes = {
	content: PropTypes.object.isRequired,
};

export default Benefits;
