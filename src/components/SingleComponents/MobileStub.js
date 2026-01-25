import React from "react";
import { useSelector } from "react-redux";

const MobileStub = () => {
	const isMobile = useSelector((state) => state.main.isMobile);
	if (!isMobile) return null;

	return (
		<div
			style={{
				position: "fixed",
				zIndex: 99999,
				left: 0,
				top: 0,
				width: "100vw",
				height: "100vh",
				background: "#1d2025",
				color: "white",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				fontSize: "22px",
				textAlign: "center",
			}}
		>
			<div>
				<b>Mobile design is in progress ⏳</b>
				<br />
				<br />
				Please, use the desktop version of the website.
			</div>
		</div>
	);
};

export default MobileStub;
