import React from "react";
import PropTypes from "prop-types";

// import "assets/scss/SingleComponents/Loader.scss";

const Loader = ({ small }) => (
	<div className={small ? "" : "height-placeholder"}>
		<div className={`main-loader ${small ? "main-loader-small" : ""}`}>
			<svg className="circular-loader" viewBox="25 25 50 50">
				<circle className="loader-path" cx="50" cy="50" r="20" fill="none" stroke="#ff9f46" strokeWidth="2" />
			</svg>
		</div>
	</div>
);
Loader.propTypes = {
	small: PropTypes.bool,
};
Loader.defaultProps = {
	small: false,
};

export default Loader;
