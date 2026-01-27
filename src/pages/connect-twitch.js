import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { toast } from "react-toastify";
import { useRouter, withRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useDispatch, useSelector } from "react-redux";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import fetchWithToken from "services/fetchWithToken";
import { setTwitchAccount } from "redux/actions/mainActions";

import "assets/scss/ConnectTwitchPage/main.scss";

const ConnectTwitch = () => {
	const router = useRouter();
	const dispatch = useDispatch();
	const { t, i18n } = useTranslation("connectTwitchPage");
	const connectTwitch = t("content", { returnObjects: true });

	const [isLoading, setIsLoading] = useState(false);

	const { twitchAccount } = useSelector((state) => state.main);

	const postConnectTwitch = async (twitchCode) => {
		setIsLoading(true);
		try {
			if (!twitchCode) {
				toast.error("Twitch code is required.");
				return;
			}

			const response = await fetchWithToken("/api/v1/twitch_account", {
				method: "POST",
				body: { code: twitchCode },
			});

			if (!response.data) {
				toast.error(`Connect Twitch failed. ${response.error}`);
				return;
			}

			toast.success("Twitch connected.");
			dispatch(setTwitchAccount(response.data.attributes));
			return router.push("/import-tokens", null, { locale: i18n.language });
		} catch (err) {
			console.error(`Error in connect Twitch: ${err}`);
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const { query } = router;
		if (query?.code) {
			postConnectTwitch(query.code);
		}
	}, [router]);

	return (
		<Container>
			<div className="main-connect-twitch-block">
				<div className="connect-twitch-content-block">
					<p className="connect-twitch-title">{connectTwitch?.title || ""}</p>
					<p className="connect-twitch-description">{connectTwitch?.description || ""}</p>
					<div className="connect-twitch-block-content">
						<p className="connect-twitch-form-title">{connectTwitch?.twitchAccount || ""}</p>
						<p className="connect-twitch-form-description">{connectTwitch?.twitchAccountDescription || ""}</p>
						{twitchAccount && <p className="connect-twitch-form-connected">{connectTwitch?.twitchAccountConnected || ""}</p>}
						{!twitchAccount && <p className="connect-twitch-form-not-connected">{connectTwitch?.twitchAccountNotConnected || ""}</p>}
						{!twitchAccount && !isLoading && (
							<div className="button-block">
								<a className="connect-twitch-button" href={`https://id.twitch.tv/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI}&response_type=code`}>
									{connectTwitch?.buttonText || ""}
								</a>
							</div>
						)}
						<div className="connect-twitch-form-perms">
							<p className="connect-twitch-form-perms-title">{connectTwitch?.perms?.title || ""}</p>
							<ul className="connect-twitch-form-perms-list">
								<li className="connect-twitch-form-perms-list-item">
									<p className="connect-twitch-form-perms-list-item-title">1. {connectTwitch?.perms?.read || ""}</p>
								</li>
							</ul>
							<ul className="connect-twitch-form-perms-list">
								<li className="connect-twitch-form-perms-list-item">
									<p className="connect-twitch-form-perms-list-item-title">2. {connectTwitch?.perms?.write || ""}</p>
								</li>
							</ul>
							<ul className="connect-twitch-form-perms-list">
								<li className="connect-twitch-form-perms-list-item">
									<p className="connect-twitch-form-perms-list-item-title">3. {connectTwitch?.perms?.chat || ""}</p>
								</li>
							</ul>
						</div>
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
			...(await serverSideTranslations(locale, ["common", "connectTwitchPage"])),
			locale,
			...getSEOOptions(resolvedUrl),
		},
	};
});

export default withRouter(ConnectTwitch);
