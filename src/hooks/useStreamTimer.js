import { useState, useEffect, useRef, useCallback } from "react";

const STREAM_CHECK_INTERVAL = 30000;

const useStreamTimer = (channelName) => {
	const [isLive, setIsLive] = useState(false);
	const [streamDuration, setStreamDuration] = useState(0);
	const [viewers, setViewers] = useState(null);
	const intervalRef = useRef(null);
	const timerRef = useRef(null);
	const baseDurationRef = useRef(0);
	const lastUpdateTimeRef = useRef(null);

	const formatTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	const checkStreamStatus = useCallback(async () => {
		if (!channelName) return;

		try {
			const [uptimeResponse, viewersResponse] = await Promise.all([
				fetch(`https://decapi.me/twitch/uptime/${channelName}`, {
					method: "GET",
				}),
				fetch(`https://decapi.me/twitch/viewercount/${channelName}`, {
					method: "GET",
				}).catch(() => null),
			]);

			if (!uptimeResponse.ok) {
				setIsLive((prevIsLive) => {
					if (prevIsLive) {
						baseDurationRef.current = 0;
						lastUpdateTimeRef.current = null;
						setStreamDuration(0);
						setViewers(null);
						return false;
					}
					return false;
				});
				return;
			}

			const uptimeText = await uptimeResponse.text();
			const trimmedText = uptimeText.trim().toLowerCase();

			let viewersCount = null;
			if (viewersResponse && viewersResponse.ok) {
				try {
					const viewersText = await viewersResponse.text();
					const trimmedViewers = viewersText.trim().toLowerCase();
					if (trimmedViewers && trimmedViewers !== "offline" && trimmedViewers !== "not found" && trimmedViewers !== "404 page not found") {
						const viewersMatch = trimmedViewers.match(/(\d+)/);
						if (viewersMatch) {
							viewersCount = parseInt(viewersMatch[1], 10);
						}
					}
				} catch (error) {
					// Ignore viewers parsing errors
				}
			}

			if (trimmedText && trimmedText !== "offline" && trimmedText !== "not found") {
				let totalSeconds = 0;

				if (trimmedText.includes(":")) {
					const parts = trimmedText.split(":");
					if (parts.length >= 3) {
						const hours = parseInt(parts[0], 10) || 0;
						const minutes = parseInt(parts[1], 10) || 0;
						const seconds = parseInt(parts[2], 10) || 0;
						totalSeconds = hours * 3600 + minutes * 60 + seconds;
					}
				} else if (trimmedText.includes("minute") || trimmedText.includes("second") || trimmedText.includes("hour")) {
					const hourMatch = trimmedText.match(/(\d+)\s*hour/);
					const minuteMatch = trimmedText.match(/(\d+)\s*minute/);
					const secondMatch = trimmedText.match(/(\d+)\s*second/);

					const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
					const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
					const seconds = secondMatch ? parseInt(secondMatch[1], 10) : 0;

					totalSeconds = hours * 3600 + minutes * 60 + seconds;
				}

				if (totalSeconds > 0) {
					baseDurationRef.current = totalSeconds;
					lastUpdateTimeRef.current = new Date();

					setIsLive((prevIsLive) => {
						if (!prevIsLive) {
							setStreamDuration(totalSeconds);
							setViewers(viewersCount);
							return true;
						}
						setStreamDuration(totalSeconds);
						setViewers(viewersCount);
						return true;
					});
					return;
				}
			}

			setIsLive((prevIsLive) => {
				if (prevIsLive) {
					baseDurationRef.current = 0;
					lastUpdateTimeRef.current = null;
					setStreamDuration(0);
					setViewers(null);
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
		if (isLive && baseDurationRef.current > 0 && lastUpdateTimeRef.current) {
			const updateTimer = () => {
				if (lastUpdateTimeRef.current) {
					const now = new Date();
					const timeSinceUpdate = Math.floor((now - lastUpdateTimeRef.current) / 1000);
					const currentDuration = baseDurationRef.current + timeSinceUpdate;
					setStreamDuration(currentDuration);
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
		if (!isLive) {
			setStreamDuration(0);
		}
	}, [isLive]);

	return {
		isLive,
		streamDuration: formatTime(streamDuration),
		viewers,
	};
};

export default useStreamTimer;
