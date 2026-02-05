import React, { useState } from "react";
import PropTypes from "prop-types";

const FAQ = ({ content }) => {
	const [openIndex, setOpenIndex] = useState(null);
	const faqs = content?.faq || [];

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="home-faq">
			<div className="home-container">
				<h2 className="home-section-title">{content?.faqTitle}</h2>
				<div className="home-faq-list">
					{faqs.map((faq, index) => (
						<div key={index} className={`home-faq-item ${openIndex === index ? "home-faq-item-open" : ""}`}>
							<button type="button" className="home-faq-question" onClick={() => toggleFAQ(index)}>
								<span className="home-faq-question-text">{faq.question}</span>
								<svg className="home-faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							{openIndex === index && <div className="home-faq-answer">{faq.answer}</div>}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

FAQ.propTypes = {
	content: PropTypes.object.isRequired,
};

export default FAQ;
