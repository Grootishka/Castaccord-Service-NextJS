import React from "react";
import Document, { Html, Main, NextScript } from "next/document";
import CustomNextHead from "components/NextComponets/CustomNextHead";

class AppDocument extends Document {
	render() {
		return (
			<Html lang="en" prefix="og: http://ogp.me/ns#">
				<CustomNextHead />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default AppDocument;
