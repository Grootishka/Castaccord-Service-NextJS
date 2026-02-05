import React from "react";
import PropTypes from "prop-types";

const WarningIcon = ({ className = "", width = 20, height = 20 }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

WarningIcon.propTypes = {
	className: PropTypes.string,
	width: PropTypes.number,
	height: PropTypes.number,
};

export default WarningIcon;
