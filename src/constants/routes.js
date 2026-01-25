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
			title: "Example — Example",
			description: "Example is a platform for creating and managing stream chat rooms.",
			keywords: "example, stream, chat, hub, rooms, management, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		en: {
			title: "Example — Example",
			description: "Example is a platform for creating and managing stream chat rooms.",
			keywords: "example, stream, chat, hub, rooms, management, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
		ru: {
			title: "Example — Example",
			description: "Example is a platform for creating and managing stream chat rooms.",
			keywords: "example, stream, chat, hub, rooms, management, platform",
			noIndex: false,
			noFollow: false,
			hasQuery: false,
		},
	},
};

export default [MainRoute];
