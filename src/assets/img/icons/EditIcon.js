import React from "react";
import PropTypes from "prop-types";

const EditIcon = ({ className = "", width = 20, height = 20 }) => (
	<svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

EditIcon.propTypes = {
	className: PropTypes.string,
	width: PropTypes.number,
	height: PropTypes.number,
};

export default EditIcon;
