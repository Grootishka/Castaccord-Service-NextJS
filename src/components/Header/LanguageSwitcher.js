import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import "assets/scss/layout/Header/LanguageSwitcher.scss";

const LanguageSwitcher = () => {
	const { i18n } = useTranslation("common");
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const languages = [
		{ code: "en", name: "English" },
		{ code: "ua", name: "Українська" },
		{ code: "ru", name: "Русский" },
	];

	const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

	const handleLanguageChange = (langCode) => {
		if (langCode !== i18n.language) {
			router.push(router.asPath, router.asPath, { locale: langCode });
		}
		setIsOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className="header-language-switcher" ref={dropdownRef}>
			<button type="button" className="header-language-switcher-button" onClick={() => setIsOpen(!isOpen)}>
				<span className="header-language-switcher-current">{currentLanguage.code.toUpperCase()}</span>
				<svg className="header-language-switcher-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>
			{isOpen && (
				<div className="header-language-switcher-dropdown">
					{languages.map((lang) => (
						<button key={lang.code} type="button" className={`header-language-switcher-option ${currentLanguage.code === lang.code ? "header-language-switcher-option-active" : ""}`} onClick={() => handleLanguageChange(lang.code)}>
							{lang.name}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

LanguageSwitcher.propTypes = {};

export default LanguageSwitcher;
