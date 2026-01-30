import React from "react";
import App from "next/app";
import { appWithTranslation } from "next-i18next";
import { withRouter } from "next/router";
import { parse } from "next-useragent";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import PropTypes from "prop-types";
import { setSSRStoreMain } from "redux/actions/mainActions";
import makeStore from "redux/makeStore";
import getAccessToken from "services/getAccessToken";
import WSocket from "services/connectWebSocket";
import fetchWithToken from "services/fetchWithToken";
import Header from "layout/Header";
import Footer from "layout/Footer";
import Scripts from "layout/Scripts";

import Loader from "components/SingleComponents/Loader";
import HelmetComponent from "components/SingleComponents/HelmetComponent";

import "assets/scss/main.scss";
import "assets/scss/react-datapicker.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const wsClient = new WSocket(process.env.wsUrl);

const mapStateToProps = (state) => ({
	isAuth: state.main.isAuth,
	isMobile: state.main.isMobile,
	isAdmin: state.main.isAdmin,
});

class WebApp extends App {
	static propTypes = {
		router: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			url: "",
		};
	}

	componentDidUpdate(prevProps) {
		const { isAuth } = this.props;
		if (prevProps.isAuth !== isAuth && isAuth) {
			// wsClient.connect();
		}
	}

	componentDidMount() {
		const { isAuth } = this.props;
		if (isAuth) {
			// wsClient.connect();
		}
	}

	render() {
		const { Component, pageProps, isAuth, isAdmin, isMobile } = this.props;
		const { isLoading } = this.state;
		return (
			<div id="next-app">
				{isLoading && <Loader />}
				{!isLoading && (
					<div className="wrapper">
						<Header {...pageProps} isAdmin={isAdmin} isAuth={isAuth} />
						<div className="main-body">
							<HelmetComponent {...pageProps} />
							<div className="content">
								<Component {...pageProps} isLoading={isLoading} wsClient={wsClient} />
							</div>
							<ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
						</div>
						{!isMobile && <Footer {...pageProps} />}
					</div>
				)}
				<Scripts />
			</div>
		);
	}
}

WebApp.getInitialProps = makeStore.getInitialAppProps((store) => async (context) => {
	const { ctx } = context;

	const SSRStoreMain = {
		isMobile: false,
		isTablet: false,
		isBanned: false,
		isAuth: false,
		isAdmin: false,
		isActive: true,
		user: {},
	};
	let ua = "";

	if (typeof window === "undefined") {
		ua = parse(ctx.req.headers["user-agent"]);
	} else {
		ua = { isMobile: window.innerWidth < 992, isTablet: window.innerWidth < 768 };
	}

	SSRStoreMain.isMobile = ua.isMobile;
	SSRStoreMain.isTablet = ua.isTablet;

	try {
		const accessToken = await getAccessToken(ctx);
		if (accessToken) {
			const [profileData, botAccounts] = await Promise.all([fetchWithToken("/api/v1/users/me", {}, "application/json", ctx), fetchWithToken("/api/v1/bot_accounts", {}, "application/json", ctx)]);

			SSRStoreMain.isAuth = !!profileData.data.id;
			SSRStoreMain.botAccounts = botAccounts.data.filter((bot) => bot.attributes.status === "active") || [];
			SSRStoreMain.user = profileData.data?.attributes || {};
		}
	} catch (e) {
		console.error(e);
	}

	store.dispatch(setSSRStoreMain(SSRStoreMain));

	return {
		...(await App.getInitialProps(context)),
		pathname: ctx.pathname,
	};
});

export default makeStore.withRedux(withRouter(connect(mapStateToProps, null)(appWithTranslation(WebApp))));
