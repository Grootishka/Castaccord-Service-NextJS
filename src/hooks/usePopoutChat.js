import { useState, useEffect, useRef, useCallback } from "react";

const CHANNEL_NAME = "chat_channel";

const usePopoutChat = (onRestoreCallback) => {
	const [isPopoutOpen, setIsPopoutOpen] = useState(false);
	const [isPopoutMode, setIsPopoutMode] = useState(false);
	const popupRef = useRef(null);
	const broadcastChannelRef = useRef(null);
	const pollingIntervalRef = useRef(null);

	const restoreDockedChat = useCallback(() => {
		if (popupRef.current) {
			popupRef.current = null;
		}
		setIsPopoutOpen(false);
		setIsPopoutMode(false);

		if (onRestoreCallback) {
			onRestoreCallback();
		}

		setTimeout(() => {
			const chatElement = document.querySelector(".main-chat-block");
			if (chatElement) {
				chatElement.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 100);
	}, [onRestoreCallback]);

	useEffect(() => {
		if (typeof window !== "undefined" && window.BroadcastChannel) {
			broadcastChannelRef.current = new BroadcastChannel(CHANNEL_NAME);

			broadcastChannelRef.current.onmessage = (event) => {
				const { type } = event.data || {};

				if (type === "chat:popout_closed") {
					restoreDockedChat();
				}
			};

			return () => {
				if (broadcastChannelRef.current) {
					broadcastChannelRef.current.close();
				}
			};
		}
	}, [restoreDockedChat]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleMessage = (event) => {
			if (event.origin !== window.location.origin) return;

			const { type } = event.data || {};

			if (type === "chat:popout_closed") {
				restoreDockedChat();
			}
		};

		window.addEventListener("message", handleMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [restoreDockedChat]);

	useEffect(() => {
		if (!isPopoutOpen || !popupRef.current) return;

		pollingIntervalRef.current = setInterval(() => {
			if (popupRef.current && popupRef.current.closed) {
				restoreDockedChat();
			}
		}, 300);

		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, [isPopoutOpen, restoreDockedChat]);

	const openChatPopup = useCallback(() => {
		if (popupRef.current && !popupRef.current.closed) {
			popupRef.current.focus();
			return;
		}

		const width = 600;
		const height = 720;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		const url = new URL("/chat-popout", window.location.origin).toString();
		const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,location=no,status=no,menubar=no`;

		const popup = window.open(url, "chatPopout", features);

		if (!popup) {
			console.warn("Popup blocked by browser. Must be opened directly from user click.");
			return;
		}

		popupRef.current = popup;
		setIsPopoutOpen(true);
		setIsPopoutMode(true);

		setTimeout(() => {
			broadcastChannelRef.current?.postMessage({ type: "chat:state_sync", data: {} });
		}, 200);
	}, []);

	return {
		isPopoutMode,
		openChatPopup,
		broadcastChannel: broadcastChannelRef.current,
	};
};

export default usePopoutChat;
