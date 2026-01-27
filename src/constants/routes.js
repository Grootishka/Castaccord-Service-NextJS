// Access Types:
// none        — public for everyone
// onlyAuth    — authorized users only
// onlyAdmin   — admins only
// onlyNotAuth — users who are not logged in

const MainRoute = {
	path: "/",
	accessType: "none",
	helmet: {
		ua: {
			title: "Castaccord",
			description: "Castaccord - це платформа для створення та керування чат-кімнатами для трансляцій.",
			keywords: "castaccord, трансляція, чат, кімнати, керування, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		en: {
			title: "Castaccord",
			description: "Castaccord - is a platform for creating and managing stream chat rooms.",
			keywords: "castaccord, stream, chat, rooms, management",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Castaccord",
			description: "Castaccord - это платформа для создания и управления чат-комнатами для трансляций.",
			keywords: "castaccord, трансляция, чат, комнаты, управление",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

const LoginRoute = {
	path: "/login",
	accessType: "onlyNotAuth",
	helmet: {
		ua: {
			title: "Вхід",
			description: "Вхід до платформи.",
			keywords: "вхід, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		en: {
			title: "Login",
			description: "Login to the platform.",
			keywords: "login, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Войти",
			description: "Войдите в платформу.",
			keywords: "войти, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

const ConnectTwitchRoute = {
	path: "/connect-twitch",
	accessType: "onlyAuth",
	helmet: {
		ua: {
			title: "Підключити Twitch",
			description: "Підключіть ваш Twitch аккаунт до платформи.",
			keywords: "twitch, підключити, аккаунт, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		en: {
			title: "Connect Twitch",
			description: "Connect your Twitch account to the platform.",
			keywords: "twitch, connect, account, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Подключить Twitch",
			description: "Подключите ваш Twitch аккаунт к платформе.",
			keywords: "twitch, подключить, аккаунт, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

export default [MainRoute, LoginRoute, ConnectTwitchRoute];
