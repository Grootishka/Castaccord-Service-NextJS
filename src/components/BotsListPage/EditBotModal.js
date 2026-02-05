import React from "react";
import Image from "next/image";
import { Modal } from "reactstrap";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";

import "assets/scss/BotsListPage/EditBotModal.scss";
import BlockIcon from "assets/img/icons/BlockIcon";

const EditBotModal = ({ isOpen, onClose, bot, editForm, setEditForm, onSave, isLoading, availableColors }) => {
	const { t } = useTranslation("botsListPage");

	return (
		<Modal isOpen={isOpen} toggle={onClose} fade={true} centered={true} backdrop={true} className="bots-list-edit-modal" backdropClassName="bots-list-edit-modal-backdrop">
			<div className="bots-list-modal-content-wrapper">
				<div className="bots-list-modal-header">
					<h2 className="bots-list-modal-title">{t("editModal.title")}</h2>
					<button className="bots-list-modal-close" type="button" onClick={onClose}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M18 6 6 18"></path>
							<path d="m6 6 12 12"></path>
						</svg>
					</button>
				</div>
				<div className="bots-list-modal-content">
					<div className="bots-list-form-group">
						<label className="bots-list-form-label">{t("editModal.icon")}</label>
						<div className="bots-list-icons-grid">
							<button key="null" type="button" className={`bots-list-icon-option ${editForm.badgeId === null ? "bots-list-icon-option-selected" : ""}`} onClick={() => setEditForm({ ...editForm, badgeId: null })}>
								<BlockIcon className="bots-list-icon-svg" width={40} height={40} />
							</button>
							{bot?.badgesList?.map((badge) => (
								<button key={badge.id} type="button" className={`bots-list-icon-option ${editForm.badgeId === badge.id ? "bots-list-icon-option-selected" : ""}`} onClick={() => setEditForm({ ...editForm, badgeId: badge.id })}>
									<Image src={badge.icon} alt={bot.username} className="bots-list-icon-image" width={40} height={40} />
								</button>
							))}
						</div>
					</div>
					<div className="bots-list-form-group">
						<label className="bots-list-form-label">{t("editModal.color")}</label>
						<div className="bots-list-colors-grid">
							{availableColors.map((color) => (
								<button key={color} type="button" className={`bots-list-color-option ${editForm.color === color ? "bots-list-color-option-selected" : ""}`} style={{ backgroundColor: color }} onClick={() => setEditForm({ ...editForm, color })} />
							))}
						</div>
					</div>
				</div>
				<div className="bots-list-modal-footer">
					<button className="bots-list-modal-cancel-btn" type="button" onClick={onClose} disabled={isLoading}>
						{t("editModal.cancel")}
					</button>
					<button className="bots-list-modal-save-btn" type="button" onClick={onSave} disabled={isLoading}>
						{isLoading ? t("editModal.saving") : t("editModal.save")}
					</button>
				</div>
			</div>
		</Modal>
	);
};

EditBotModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	bot: PropTypes.object,
	editForm: PropTypes.shape({
		badgeId: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
		color: PropTypes.string,
	}).isRequired,
	setEditForm: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	availableColors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

EditBotModal.defaultProps = {
	bot: null,
};

export default EditBotModal;
