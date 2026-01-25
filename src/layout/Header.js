import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Container } from "reactstrap";
import PropTypes from "prop-types";
import { setIsMobile } from "redux/actions/mainActions";
import { useTranslation } from "next-i18next";

import "assets/scss/layout/Header.scss";

const Header = ({ isAuth }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation("homePage");
	const header = t("header", { returnObjects: true });

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

	return (
		<Container>
			<div className="header-block"></div>
		</Container>
	);
};

Header.propTypes = {
	isAuth: PropTypes.bool.isRequired,
};

export default Header;
