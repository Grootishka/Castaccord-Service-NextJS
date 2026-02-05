import React, { useEffect } from "react";
import { useRouter, withRouter } from "next/router";
import { Container } from "reactstrap";
import { useTranslation } from "next-i18next";
import { setCookie } from "cookies-next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import Hero from "components/HomePage/Hero";
import Features from "components/HomePage/Features";
import Benefits from "components/HomePage/Benefits";
import FAQ from "components/HomePage/FAQ";
import CTA from "components/HomePage/CTA";

import "assets/scss/HomePage/main.scss";

const Index = () => {
	const router = useRouter();
	const { t } = useTranslation("homePage");
	const content = t("content", { returnObjects: true });

	const saveRefCodeToCookie = async (refCode) => {
		await setCookie("refCodeCommentsService", refCode);
	};

	useEffect(() => {
		const { query } = router;
		if (query?.ref) {
			saveRefCodeToCookie(query.ref);
		}
	}, []);

	return (
		<div className="home-page">
			<Hero content={content} />
			<Features content={content} />
			<Benefits content={content} />
			<FAQ content={content} />
			<CTA content={content} />
		</div>
	);
};

export const getServerSideProps = withSSRRedirect(async (param) => {
	const { locale, resolvedUrl } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["homePage", "common"])),
			locale,
			...getSEOOptions(resolvedUrl, "", locale),
		},
	};
});

export default withRouter(Index);
