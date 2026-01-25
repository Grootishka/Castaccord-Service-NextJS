import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { setIsAuth } from "redux/actions/mainActions";
import fetchData from "services/fetchData";

const postGoogleSignIn = async ({ googleToken, ref }) => {
	try {
		const response = await fetchData("/api/auth/google-sign-in", {
			method: "POST",
			body: { googleToken, ref },
		});

		const json = await response.json();

		if (!json.success) {
			throw new Error(json?.error || "Auth failed");
		}

		const { accessToken, userID } = json.data;

		const expires = new Date();
		expires.setFullYear(expires.getFullYear() + 1);

		setCookie("accessToken", accessToken, { expires });
		setCookie("userID", userID, { expires });

		setIsAuth(true);

		return {
			success: true,
		};
	} catch (err) {
		toast.error("Google login failed");
		return { success: false };
	}
};

export default postGoogleSignIn;
