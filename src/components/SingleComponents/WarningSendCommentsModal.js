import React, { useState, useEffect } from "react";
import { Modal } from "reactstrap";
import { useTranslation } from "react-i18next";

import "assets/scss/SingleComponents/WarningSendCommentsModal.scss";

const STORAGE_KEY = "dontShowSendCommentsWarning";

const SendCommentsWarningModal = ({ isOpen, onClose }) => {
	const { t } = useTranslation("dashboardPage");
	const [dontShow, setDontShow] = useState(false);

	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY) === "1") {
			onClose();
		}
	}, [onClose]);

	const handleCheckboxChange = (e) => {
		const { checked } = e.target;
		setDontShow(checked);
		if (checked) {
			localStorage.setItem(STORAGE_KEY, "1");
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<Modal isOpen={isOpen} toggle={handleClose} fade={true} centered={true} backdrop="static" className="warning-comments-modal" backdropClassName="warning-comments-modal-backdrop">
			<div className="modal-warning-block">
				<h2 className="modal-warning-title">{t("send_comment_warning.title")}</h2>

				<p className="modal-warning-paragraph">{t("send_comment_warning.part1")}</p>
				<p className="modal-warning-paragraph">{t("send_comment_warning.part2")}</p>

				<p className="modal-warning-always">{t("send_comment_warning.always_check")}</p>
				<ul className="modal-warning-list">
					<li>{t("send_comment_warning.check1")}</li>
					<li>{t("send_comment_warning.check2")}</li>
				</ul>

				<p className="modal-warning-paragraph">{t("send_comment_warning.part3")}</p>

				<div className="modal-warning-checkbox-row">
					<input type="checkbox" id="dontShowAgain" checked={dontShow} onChange={handleCheckboxChange} />
					<label className="check-box-label" htmlFor="dontShowAgain">
						{t("send_comment_warning.checkbox")}
					</label>
				</div>
				<div className="modal-warning-button" onClick={handleClose}>
					{t("send_comment_warning.button")}
				</div>
			</div>
		</Modal>
	);
};

export default SendCommentsWarningModal;
