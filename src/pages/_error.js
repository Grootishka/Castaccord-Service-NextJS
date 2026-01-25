import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// eslint-disable-next-line no-restricted-imports
import { i18n } from "../../next-i18next.config";

const NotFound = dynamic(() => import("components/SingleComponents/NotFound"));

const Error = () => {
	const { t } = useTranslation("notfoundPage");
	const router = useRouter();
	const content = t("", { returnObjects: true });

	return <NotFound content={content} router={router} />;
};

export const getStaticProps = async (param) => {
	let { locale } = param;

	if (!locale) {
		locale = i18n.defaultLocale;
	}

	return {
		props: {
			...(await serverSideTranslations(locale, ["homePage", "notfoundPage"])),
		},
	};
};

export default Error;
