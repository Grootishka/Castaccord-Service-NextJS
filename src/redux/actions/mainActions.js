import * as types from "redux/constants";

const deleteBot = (botId) => ({
	type: types.DELETE_BOT,
	botId,
});

const editBot = (botId, payload) => ({
	type: types.EDIT_BOT,
	botId,
	payload,
});

const upsertBot = (bot) => ({
	type: types.UPSERT_BOT,
	bot,
});

const setSSRStoreMain = (payload) => ({
	type: types.SET_SSR_STORE_MAIN,
	payload,
});
const setIsMobile = (value) => ({
	type: types.SET_IS_MOBILE,
	isMobile: value,
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

export { deleteBot, editBot, upsertBot, setInitialValues, setIsAuth, setIsActive, setIsMobile, setSSRStoreMain, setUser };
