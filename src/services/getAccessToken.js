import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import { setIsAuth } from "redux/actions/mainActions";

// tokenData:
/*
{
	accessToken: ACCESS_TOKEN,
	refreshToken: REFRESH_TOKEN,
}
*/

const getAccessToken = async (ctx, ip = null) => {
	let accessToken = "";

	if (hasCookie("accessToken", ctx)) {
		accessToken = await getCookie("accessToken", ctx);

		// if (isTokenExpired(accessToken)) {
		// 	await deleteCookie("accessToken", ctx);
		// 	accessToken = "";
		// }
	}

	if (!accessToken) {
		setIsAuth(false);
	}

	return accessToken;
};

export default getAccessToken;
