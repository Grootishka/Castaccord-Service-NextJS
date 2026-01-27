import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useTranslation } from "next-i18next";

import "assets/scss/SingleComponents/NotFound.scss";

class NotFound extends Component {
	static propTypes = {
		content: PropTypes.object,
		router: PropTypes.object,
	};

	render() {
		const { content, router } = this.props;
		const { i18n } = useTranslation("common");
		return (
			<div className="not-found-container container">
				<Row noGutters>
					<Col xs={12} lg={{ size: 8, offset: 2 }}>
						<div className="col-not-found">
							<div className="not-found-title-wrapper">
								<h1 className="not-found-title">{content?.onlyForAuthUsers}</h1>
							</div>
							<div
								className="login-button"
								onClick={() => {
									router.push("/login", null, { locale: i18n.language });
								}}
							>
								{content?.loginPage}
							</div>
						</div>
					</Col>
				</Row>
			</div>
		);
	}
}

export default NotFound;
