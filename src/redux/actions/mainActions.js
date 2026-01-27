import * as types from "redux/constants";

const setSSRStoreMain = (payload) => ({
	type: types.SET_SSR_STORE_MAIN,
	payload,
});
const setIsMobile = (value) => ({
	type: types.SET_IS_MOBILE,
	isMobile: value,
});

const setTwitchAccount = (value) => ({
	type: types.SET_TWITCH_ACCOUNT,
	twitchAccount: value,
});

const setIsAdmin = (value) => ({
	type: types.SET_IS_ADMIN,
	isAdmin: value,
});
const setIsAuth = (value) => ({
	type: types.SET_IS_AUTH,
	isAuth: value,
});

const setIsActive = (value) => ({
	type: types.SET_IS_ACTIVE,
	isBanned: value,
});
const setUser = (value) => ({
	type: types.SET_USER,
	user: value,
});
const setInitialValues = () => ({
	type: types.SET_INITIAL_VALUES,
});

export { setInitialValues, setIsAuth, setIsActive, setIsMobile, setSSRStoreMain, setUser, setTwitchAccount };
