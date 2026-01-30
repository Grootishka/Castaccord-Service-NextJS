import React, { useEffect } from "react";
import { useRouter, withRouter } from "next/router";
import { Container } from "reactstrap";
import { useTranslation } from "next-i18next";
import { setCookie } from "cookies-next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";

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
		<Container nogutters="true">
			<div className="main-block"></div>
		</Container>
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
