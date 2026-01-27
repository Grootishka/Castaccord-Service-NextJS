import fetch from "isomorphic-fetch";

const fetchData = (url, options = {}, contentType = "application/json", additionalHeaders = {}) => {
	const headers = {
		Accept: "application/json",
		...additionalHeaders,
	};

	if (contentType) {
		headers["Content-Type"] = contentType;
	}

	const isServer = typeof window === "undefined";
	const originUrl = isServer ? process.env.API_INTERNAL || process.env.API : "";

	if (options.body && typeof options.body === "object") {
		options.body = JSON.stringify(options.body);
	}

	return fetch(`${originUrl}${url}`, {
		headers,
		credentials: "include", // this sends cookies and credentials
		...options,
	});
};

export default fetchData;
