import { deleteCookie } from "cookies-next";

import fetchData from "services/fetchData";
import getAccessToken from "services/getAccessToken";

const redirectOnStatusCodes = {
	401: `${process.env.baseUrl}${process.env.NEXT_PUBLIC_SITE_URL}/login`,
};

const fetchWithToken = async (url, options = {}, contentType = "application/json", ctx = null) => {
	const headers = {};

	const accessToken = await getAccessToken(ctx);
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const makeFetch = () => fetchData(url, { ...options }, contentType, headers);

	let response = await makeFetch();

	if (Object.keys(redirectOnStatusCodes).includes(response.status.toString())) {
		await deleteCookie("accessToken", ctx);

		if (typeof window !== "undefined") {
			window.location.href = redirectOnStatusCodes[response.status];
		}

		return null;
	}

	if (response.status === 403) {
		response = await makeFetch();
	}

	const json = await response.json();

	return json;
};

export default fetchWithToken;
