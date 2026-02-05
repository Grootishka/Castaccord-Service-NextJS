const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});
const { i18n } = require("./next-i18next.config");

module.exports = withBundleAnalyzer({
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (configWebpack, options) => {
		const nextCssLoaders = configWebpack.module.rules.find((rule) => typeof rule.oneOf === "object");
		nextCssLoaders.oneOf.forEach((loader) => {
			if (loader.issuer && loader.issuer.and && loader.issuer.and.join("").toLowerCase().includes("app")) {
				delete loader.issuer;
			}
		});
		return configWebpack;
	},
	rewrites: async () => [
		{
			source: "/api/:path*",
			destination: "http://web:3001/api/:path*",
		},
	],
	env: {
		apiUrl: process.env.API,
		baseUrl: process.env.BASE_URL,
		gaCode: process.env.GA_CODE,
		fbPixelId: process.env.FB_PIXEL_ID,
		wsUrl: process.env.WS,
	},
	i18n,
	sassOptions: {
		includePaths: [path.join(__dirname, "assets/scss")],
	},
	images: {
		domains: ["static-cdn.jtvnw.net"],
	},
});
