import React, { useState } from "react";
import { useRouter, withRouter } from "next/router";
import { setCookie } from "cookies-next";
import { Container } from "reactstrap";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import { setIsAuth } from "redux/actions/mainActions";
import withSSRRedirect from "helpers/withSSRRedirect";
import fetchWithToken from "services/fetchWithToken";

import getSEOOptions from "services/getSEOOptions";

import "assets/scss/LoginPage/main.scss";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const { t, i18n } = useTranslation("loginPage");
	const login = t("content", { returnObjects: true });

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetchWithToken("/api/v1/auth/sign_in", {
				method: "POST",
				body: { api_v1_user: { email, password } },
			});

			if (response.status.code === 200) {
				let expires = new Date();

				expires = new Date(expires.getUTCFullYear() + 1, expires.getUTCMonth(), expires.getUTCDate());
				await setCookie("accessToken", response.token, { expires });
				setIsAuth(true);

				return router.push("/connect-twitch", null, { locale: i18n.language });
			}

			toast.error(`Login failed. ${response.error}`);
		} catch (err) {
			console.error(`Error in login: ${err}`);
			toast.error("Something went wrong. Please try again.");
		}
	};

	return (
		<Container>
			<div className="main-login-block">
				<div className="login-content-block">
					<p className="login-title">{login?.title || ""}</p>
					<p className="login-description">{login?.description || ""}</p>
					<div className="login-block-content">
						<form className="login-form" onSubmit={handleSubmit}>
							<input className="input-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={login?.emailPlaceholder || ""} />
							<input className="input-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={login?.passwordPlaceholder || ""} />
							<button className="login-button-default" type="submit">
								{login?.buttonText || ""}
							</button>
						</form>
					</div>
				</div>
			</div>
		</Container>
	);
};

export const getServerSideProps = withSSRRedirect(async (param) => {
	const { locale, resolvedUrl } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["common", "loginPage"])),
			locale,
			...getSEOOptions(resolvedUrl),
		},
	};
});

export default withRouter(Login);
