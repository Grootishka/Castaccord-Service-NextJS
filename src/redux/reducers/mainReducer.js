import { HYDRATE } from "next-redux-wrapper";

import * as types from "redux/constants";

const initialState = {
	isMobile: false,
	isTablet: false,
	isAuth: false,
	isAdmin: false,
	user: null,
	twitchAccount: null,
	botAccounts: [],
};

export default function reducer(state = initialState, actions = {}) {
	switch (actions.type) {
		case HYDRATE: {
			const nextState = {
				...state, // use previous state
				...actions.payload.main, // apply delta from hydration
			};

			if (state.count) {
				nextState.count = state.count;
			}

			return nextState;
		}
		case types.SET_SSR_STORE_MAIN:
			return {
				...actions.payload,
			};
		case types.SET_IS_AUTH:
			return {
				...state,
				isAuth: actions.isAuth,
			};
		case types.SET_IS_ADMIN:
			return {
				...state,
				isAdmin: actions.isAdmin,
			};
		case types.SET_IS_ACTIVE:
			return {
				...state,
				isActive: actions.isActive,
			};
		case types.SET_IS_MOBILE:
			return {
				...state,
				isMobile: actions.isMobile,
			};
		case types.SET_USER:
			return {
				...state,
				user: actions.user,
			};
		case types.SET_TWITCH_ACCOUNT:
			return {
				...state,
				twitchAccount: actions.twitchAccount,
			};
		case types.SET_INITIAL_VALUES:
			return {
				...initialState,
			};
		default:
			return state;
	}
}
