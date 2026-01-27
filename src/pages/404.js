import React from "react";
import { Row, Col } from "reactstrap";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import "assets/scss/SingleComponents/NotFound.scss";

const Page404 = () => {
	const { t, i18n } = useTranslation("notfoundPage");
	const router = useRouter();

	return (
		<div className="not-found-container container">
			<Row noGutters>
				<Col xs={12} lg={{ size: 8, offset: 2 }}>
					<div className="col-not-found">
						<div className="not-found-title-wrapper">
							<h1 className="not-found-title">{t("onlyForAuthUsers")}</h1>
						</div>
						<div
							className="login-button"
							onClick={() => {
								router.push("/login", null, { locale: i18n.language });
							}}
						>
							{t("loginPage")}
						</div>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export const getStaticProps = async (param) => {
	const { locale } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["homePage", "notfoundPage"])),
		},
	};
};

export default Page404;
