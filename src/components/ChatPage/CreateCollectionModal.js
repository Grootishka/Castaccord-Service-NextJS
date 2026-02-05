import React, { useState } from "react";
import { Modal } from "reactstrap";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";
import fetchWithToken from "services/fetchWithToken";
import { toast } from "react-toastify";
import CloseIcon from "assets/img/icons/CloseIcon";

import "assets/scss/ChatPage/PreparedMessages.scss";

const CreateCollectionModal = ({ isOpen, onClose, onSuccess }) => {
	const { t } = useTranslation("chatPage");
	const [title, setTitle] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error(t("content.preparedMessages.collectionTitleRequired"));
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetchWithToken("/api/v1/prepared_message_collections", {
				method: "POST",
				body: {
					prepared_message_collection: {
						title: title.trim(),
					},
				},
			});

			if (response?.data) {
				toast.success(t("content.preparedMessages.collectionCreated"));
				setTitle("");
				onSuccess();
			} else if (response?.errors) {
				toast.error(response.errors.join(", "));
			}
		} catch (error) {
			console.error("Error creating collection:", error);
			toast.error(t("content.preparedMessages.createError"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setTitle("");
		onClose();
	};

	return (
		<Modal isOpen={isOpen} toggle={handleClose} fade={true} centered={true} backdrop={true} className="prepared-messages-modal" backdropClassName="prepared-messages-modal-backdrop">
			<div className="prepared-messages-modal-content-wrapper">
				<div className="prepared-messages-modal-header">
					<h2 className="prepared-messages-modal-title">{t("content.preparedMessages.createCollection")}</h2>
					<div className="prepared-messages-modal-header-actions">
						<button className="prepared-messages-modal-close" type="button" onClick={handleClose}>
							<CloseIcon width={20} height={20} />
						</button>
					</div>
				</div>
				<form onSubmit={handleSubmit}>
					<div className="prepared-messages-modal-content">
						<div className="prepared-messages-form-group">
							<label className="prepared-messages-form-label">{t("content.preparedMessages.collectionTitle")}</label>
							<input type="text" className="prepared-messages-form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("content.preparedMessages.collectionTitlePlaceholder")} disabled={isLoading} autoFocus />
						</div>
					</div>
					<div className="prepared-messages-modal-footer">
						<button className="prepared-messages-modal-cancel-btn" type="button" onClick={handleClose} disabled={isLoading}>
							{t("content.preparedMessages.cancel")}
						</button>
						<button className="prepared-messages-modal-save-btn" type="submit" disabled={isLoading || !title.trim()}>
							{isLoading ? t("content.preparedMessages.creating") : t("content.preparedMessages.create")}
						</button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

CreateCollectionModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
};

export default CreateCollectionModal;
