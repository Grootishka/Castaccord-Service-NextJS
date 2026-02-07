import { useState, useEffect, useRef, useCallback } from "react";

const STREAM_CHECK_INTERVAL = 30000;
const TWITCH_API_URL = "https://api.twitch.tv/helix/streams";

const useStreamTimer = (channelName) => {
	const [isLive, setIsLive] = useState(false);
	const [streamDuration, setStreamDuration] = useState(0);
	const [streamStartTime, setStreamStartTime] = useState(null);
	const intervalRef = useRef(null);
	const timerRef = useRef(null);
	const streamStartTimeRef = useRef(null);

	const formatTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	const checkStreamStatus = useCallback(async () => {
		if (!channelName) return;

		try {
			const response = await fetch(`${TWITCH_API_URL}?user_login=${channelName}`, {
				method: "GET",
				headers: {
					"Client-ID": "kimne78kx3ncx6br4t3ngy89h46ko",
				},
			});

			if (!response.ok) {
				return;
			}

			const data = await response.json();
			const stream = data?.data?.[0];

			if (stream && stream.type === "live") {
				const startedAt = new Date(stream.started_at);
				const startedAtTime = startedAt.getTime();

				setIsLive((prevIsLive) => {
					if (!prevIsLive) {
						streamStartTimeRef.current = startedAt;
						setStreamStartTime(startedAt);
						setStreamDuration(0);
						return true;
					}
					if (streamStartTimeRef.current && streamStartTimeRef.current.getTime() !== startedAtTime) {
						streamStartTimeRef.current = startedAt;
						setStreamStartTime(startedAt);
						setStreamDuration(0);
					}
					return true;
				});
				return;
			}
			setIsLive((prevIsLive) => {
				if (prevIsLive) {
					streamStartTimeRef.current = null;
					setStreamStartTime(null);
					setStreamDuration(0);
					return false;
				}
				return false;
			});
		} catch (error) {
			console.error("Error checking stream status:", error);
		}
	}, [channelName]);

	useEffect(() => {
		if (!channelName) return;

		checkStreamStatus();

		intervalRef.current = setInterval(() => {
			checkStreamStatus();
		}, STREAM_CHECK_INTERVAL);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [channelName, checkStreamStatus]);

	useEffect(() => {
		if (isLive && streamStartTime) {
			const updateTimer = () => {
				if (streamStartTimeRef.current) {
					const now = new Date();
					const diff = Math.floor((now - streamStartTimeRef.current) / 1000);
					setStreamDuration(diff);
				}
			};

			updateTimer();
			timerRef.current = setInterval(updateTimer, 1000);

			return () => {
				if (timerRef.current) {
					clearInterval(timerRef.current);
					timerRef.current = null;
				}
			};
		}
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setStreamDuration(0);
	}, [isLive, streamStartTime]);

	return {
		isLive,
		streamDuration: formatTime(streamDuration),
	};
};

export default useStreamTimer;
