import qs from "qs";

import routes from "constants/routes";
import makeStore from "redux/makeStore";
import handleRedirect from "services/handleRedirect";

const withSSRRedirect = (ssrCallBack) =>
	makeStore.getServerSideProps((store) => async (params) => {
		const reduxStore = store.getState();

		const { isAuth, isActive, isAdmin } = reduxStore.main;
		const asPath = params.resolvedUrl;
		const [pathname] = asPath.split("?");
		const { locale } = params;

		const currentRoute = routes.find((route) => pathname === route.path);

		if (currentRoute) {
			const { isWithRedirect, redirectPath } = handleRedirect(currentRoute, { isAuth, isActive, isAdmin }, pathname);
			if (isWithRedirect) {
				let additionalQuery = "";

				if (redirectPath === "/login") {
					additionalQuery = `?${qs.stringify({ ...params.query, redirectOnLogin: pathname })}`;
				} else {
					additionalQuery = params.query?.promo ? `?${qs.stringify({ promo: params.query.promo })}` : "";
				}

				const destination = locale === "en" ? `${redirectPath}${additionalQuery}` : `${locale}${redirectPath}${additionalQuery}`;

				return { props: {}, redirect: { destination, basePath: false } };
			}
		}

		return ssrCallBack(params, store);
	});

export default withSSRRedirect;
