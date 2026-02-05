import { HYDRATE } from "next-redux-wrapper";

import * as types from "redux/constants";

const initialState = {
	isMobile: false,
	isTablet: false,
	isAuth: false,
	isAdmin: false,
	user: null,
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
		case types.SET_INITIAL_VALUES:
			return {
				...initialState,
			};
		case types.EDIT_BOT:
			return {
				...state,
				botAccounts: state.botAccounts.map((bot) => {
					const botId = bot?.attributes?.id;
					if (botId != null && Number(botId) === Number(actions.botId)) {
						return {
							...bot,
							attributes: {
								...bot.attributes,
								...(actions.payload.badge_id !== undefined && {
									selected_badge_id: actions.payload.badge_id,
								}),
								...(actions.payload.chat_color !== undefined && {
									chat_color: actions.payload.chat_color,
								}),
							},
						};
					}
					return bot;
				}),
			};
		case types.UPSERT_BOT: {
			const incoming = actions.bot;
			if (!incoming || !incoming.attributes) {
				return state;
			}

			const incomingId = incoming.attributes.id != null ? incoming.attributes.id : Number(incoming.id);
			if (!Number.isFinite(Number(incomingId))) {
				return state;
			}

			let found = false;
			const updated = state.botAccounts.map((bot) => {
				const botId = bot?.attributes?.id;
				if (botId != null && Number(botId) === Number(incomingId)) {
					found = true;
					return incoming;
				}
				return bot;
			});

			if (!found) {
				updated.push(incoming);
			}

			return {
				...state,
				botAccounts: updated,
			};
		}
		case types.DELETE_BOT:
			return {
				...state,
				botAccounts: state.botAccounts.filter((bot) => {
					const botId = bot?.attributes?.id;
					return botId != null && Number(botId) !== Number(actions.botId);
				}),
			};
		default:
			return state;
	}
}
