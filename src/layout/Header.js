import React, { useEffect } from "react";
import { Container } from "reactstrap";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { setIsMobile } from "redux/actions/mainActions";
import { useTranslation } from "next-i18next";
import NavBar from "components/Header/NavBar";

import "assets/scss/layout/Header/Header.scss";

const Header = ({ isAuth }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation("common");
	const header = t("header", { returnObjects: true });
	const router = useRouter();

	const resizeListener = () => {
		if (typeof window !== "undefined") {
			dispatch(setIsMobile(window.innerWidth < 992));
		}
	};

	useEffect(() => {
		resizeListener();
		window.addEventListener("resize", resizeListener);
		return () => {
			window.removeEventListener("resize", resizeListener);
		};
	}, []);

	const handleLoginClick = () => {
		router.push("/login");
	};

	const handleLogoClick = () => {
		router.push("/");
	};

	return (
		<div className="header-background">
			<Container>
				<div className="header-block">
					<div className="header-logo-block">
						{/* <div className="header-logo">
							<Image src={logoUrl} width={32} height={32} alt="logo" />
						</div> */}
						<div className="header-logo-text" onClick={handleLogoClick}>
							<p className="title">{header?.title || ""}</p>
						</div>
					</div>
					{isAuth && <NavBar />}
					{!isAuth && (
						<div className="login-block">
							<div className="login-button" onClick={handleLoginClick}>
								<p className="login-button-text">{header?.login || ""}</p>
							</div>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
};

Header.propTypes = {
	isAuth: PropTypes.bool.isRequired,
};

export default Header;
