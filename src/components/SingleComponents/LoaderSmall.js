import React from "react";

const LoaderSmall = () => (
	<span>
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 8 1" enableBackground="new 0 0 0 0">
			<circle fill="#fff" stroke="none" cx="2" cy="0.5" r="0.35">
				<animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1" />
			</circle>
			<circle fill="#fff" stroke="none" cx="4" cy="0.5" r="0.35">
				<animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2" />
			</circle>
			<circle fill="#fff" stroke="none" cx="6" cy="0.5" r="0.35">
				<animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3" />
			</circle>
		</svg>
	</span>
);

export default LoaderSmall;
