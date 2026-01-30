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

const ImportTokensRoute = {
	path: "/import-tokens",
	accessType: "onlyAuth",
	helmet: {
		en: {
			title: "Import Tokens",
			description: "Import your tokens to the platform.",
			keywords: "tokens, import, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Импортировать токены",
			description: "Импортируйте ваши токены в платформу.",
			keywords: "токены, импортировать, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ua: {
			title: "Імпортувати токену",
			description: "Імпортуйте ваш токен до платформи.",
			keywords: "токен, імпортувати, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

const ChatRoute = {
	path: "/chat",
	accessType: "onlyAuth",
	helmet: {
		en: {
			title: "Chat",
			description: "Chat on the platform.",
			keywords: "chat, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Чат",
			description: "Чат на платформе.",
			keywords: "чат, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ua: {
			title: "Чат",
			description: "Чат на платформі.",
			keywords: "чат, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

const ChatPopoutRoute = {
	path: "/chat-popout",
	accessType: "onlyAuth",
	helmet: {
		en: {
			title: "Chat Popout",
			description: "Chat popout on the platform.",
			keywords: "chat, popout, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Чат в отдельном окне",
			description: "Чат в отдельном окне на платформе.",
			keywords: "чат, отдельный окно, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ua: {
			title: "Чат у відокремленому вікні",
			description: "Чат у відокремленому вікні на платформі.",
			keywords: "чат, відокремлене вікно, платформа",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

export default [MainRoute, LoginRoute, ImportTokensRoute, ChatRoute, ChatPopoutRoute];
