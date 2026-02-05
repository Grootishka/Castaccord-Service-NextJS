import React from "react";
import PropTypes from "prop-types";

const CloseIcon = ({ className = "", width = 20, height = 20 }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		<path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

CloseIcon.propTypes = {
	className: PropTypes.string,
	width: PropTypes.number,
	height: PropTypes.number,
};

export default CloseIcon;
