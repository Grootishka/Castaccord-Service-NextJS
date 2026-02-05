import React from "react";
import PropTypes from "prop-types";

const BlockIcon = ({ className = "", width = 24, height = 24 }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12Zm11 9A9 9 0 0 1 4.968 6.382l12.65 12.65A8.962 8.962 0 0 1 12 21Zm7.032-3.382a9 9 0 0 0-12.65-12.65l12.65 12.65Z" clipRule="evenodd" fill="currentColor" />
	</svg>
);

BlockIcon.propTypes = {
	className: PropTypes.string,
	width: PropTypes.number,
	height: PropTypes.number,
};

export default BlockIcon;
