import { BAN_PAGE, DASHBOARD_PAGE, LOGIN_PAGE } from "constants/links";

const redirectOptions = {
	onlyAuth: (options) => {
		if (!options.isActive) {
			return BAN_PAGE;
		}

		return DASHBOARD_PAGE;
	},
	onlyAdmin: () => LOGIN_PAGE,
	onlyNotAuth: (options) => {
		if (!options.isActive) {
			return LOGIN_PAGE;
		}

		return DASHBOARD_PAGE;
	},
	onlyBanned: (options) => {
		if (options.isActive && options.isAuth) {
			return DASHBOARD_PAGE;
		}

		if (options.isActive && !options.isAuth) {
			return LOGIN_PAGE;
		}

		return BAN_PAGE;
	},
};

const getIsWithRedirect = (accessType, options) => {
	if (accessType === "onlyNotAuth" && options.isAuth) {
		return true;
	}

	if (accessType === "onlyAuth" && !options.isAuth) {
		return true;
	}

	if (accessType === "onlyBanned" && options.isActive) {
		return true;
	}

	if (accessType === "onlyEmailRequested" && !options.isAuth) {
		return true;
	}

	if (accessType === "onlyAdmin" && !options.isAdmin) {
		return true;
	}

	return false;
};

const handleRedirect = (route, options) => {
	const basePath = "";
	const resultObject = {
		isWithRedirect: false,
		redirectPath: "",
		basePath,
	};

	if (!route || !route.accessType || route.accessType === "none") {
		return resultObject;
	}

	const accessTypeRedirectPath = redirectOptions[route.accessType](options);

	if (accessTypeRedirectPath === undefined) {
		return resultObject;
	}

	resultObject.isWithRedirect = getIsWithRedirect(route.accessType, options);
	resultObject.redirectPath = resultObject.isWithRedirect ? `${basePath}${accessTypeRedirectPath}` : "";

	return resultObject;
};

export default handleRedirect;
