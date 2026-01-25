import React, { useEffect, useState } from "react";
import { useRouter, withRouter } from "next/router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getCookie, setCookie } from "cookies-next";
import { Container } from "reactstrap";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import { setIsAuth } from "redux/actions/mainActions";
import withSSRRedirect from "helpers/withSSRRedirect";
import fetchWithToken from "services/fetchWithToken";
// import GoogleButton from "components/LoginButtons/GoogleButton";

import getSEOOptions from "services/getSEOOptions";

const socialConfig = [
	{
		code: "google",
		component: (config, text) => (
			<GoogleOAuthProvider clientId={config.appId}>
				<GoogleButton text={text} />
			</GoogleOAuthProvider>
		),
	},
];

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const [socialNetworks, setSocialNetworks] = useState({});

	const { t, i18n } = useTranslation("loginPage");

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetchWithToken("/api/auth/login", {
				method: "POST",
				body: { email, password },
			});
			if (response.success) {
				let expires = new Date();

				expires = new Date(expires.getUTCFullYear() + 1, expires.getUTCMonth(), expires.getUTCDate());
				await setCookie("accessToken", response.data.accessToken, { expires });
				await setCookie("userID", response.data.usersID, { expires });
				setIsAuth(true);

				return router.push("/dashboard", null, { locale: i18n.language });
			}

			toast.error(`Login failed. ${response.error}`);
		} catch (err) {
			console.error(`Error in login: ${err}`);
			toast.error("Something went wrong. Please try again.");
		}
	};

	const saveRefCodeToCookie = async (refCode) => {
		await setCookie("refCodeCommentsService", refCode);
	};

	useEffect(() => {
		const ref = getCookie("refCodeCommentsService");
		const { query } = router;
		if (query?.ref && query.ref !== ref) {
			saveRefCodeToCookie(query.ref);
		}
	}, []);

	const handleRegisterClick = (e) => {
		e.preventDefault();
		router.push("/register", null, { locale: i18n.language });
	};

	const fetchSocialNetworks = async () => {
		try {
			const socialNetworksResponse = await fetchWithToken("/api/auth/social-networks-config");

			if (!socialNetworksResponse.success) {
				toast.error(socialNetworksResponse.errorCode ? t(socialNetworksResponse.errorCode, { ns: "errors" }) : socialNetworksResponse.error);

				return false;
			}

			if (socialNetworksResponse.data?.socialNetworks) {
				setSocialNetworks(socialNetworksResponse.data.socialNetworks);
			}
		} catch (e) {
			console.error(e);

			return false;
		}
	};

	useEffect(() => {
		fetchSocialNetworks();
	}, []);

	const buttonsForRender = socialConfig.filter(({ code }) => socialNetworks[code] && socialNetworks[code].active);

	return (
		<Container>
			<div className="login-container">
				<div className="main-login-block">
					<p className="login-title">{t("signin_title")}</p>
					<form onSubmit={handleSubmit}>
						<input className="input-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email_placeholder")} />
						<input className="input-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t("password_placeholder")} />
						<button className="login-button-default" type="submit">
							{t("login_btn")}
						</button>
					</form>
					<p className="or-text">Or</p>
					{buttonsForRender.map(({ code, component }) => (
						<div key={code} className="login-variant">
							{component(socialNetworks[code], t("sign_in_with_google"))}
						</div>
					))}
					<p className="not-registered">
						{t("not_registered")}
						<span className="register-page" onClick={handleRegisterClick}>
							{t("register")}
						</span>
					</p>
				</div>
			</div>
		</Container>
	);
};

export const getServerSideProps = withSSRRedirect(async (param) => {
	const { locale, resolvedUrl } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["homePage", "loginPage"])),
			locale,
			...getSEOOptions(resolvedUrl),
		},
	};
});

export default withRouter(Login);
