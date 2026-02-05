import React, { useState, useEffect, useRef } from "react";
import { Modal } from "reactstrap";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";
import fetchWithToken from "services/fetchWithToken";
import { toast } from "react-toastify";
import CloseIcon from "assets/img/icons/CloseIcon";
import DeleteIcon from "assets/img/icons/DeleteIcon";
import EditIcon from "assets/img/icons/EditIcon";

import "assets/scss/ChatPage/PreparedMessages.scss";

const CollectionModal = ({ isOpen, onClose, collection, onUpdate, onDelete }) => {
	const { t } = useTranslation("chatPage");
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [newMessageText, setNewMessageText] = useState("");
	const [editingTitle, setEditingTitle] = useState(false);
	const [collectionTitle, setCollectionTitle] = useState("");
	const [deletingMessageId, setDeletingMessageId] = useState(null);
	const messageInputRef = useRef(null);

	const collectionId = collection?.data?.id;
	const collectionData = collection?.data?.attributes;

	const loadMessages = async () => {
		if (!collectionId) return;

		try {
			setIsLoading(true);
			const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}/prepared_messages`);
			if (response?.data) {
				setMessages(response.data);
			}
		} catch (error) {
			console.error("Error loading messages:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen && collection) {
			setCollectionTitle(collectionData?.title || "");
			if (collection.included && collection.included.length > 0) {
				setMessages(collection.included.filter((item) => item.type === "prepared_message"));
			} else if (collectionId) {
				loadMessages();
			}
			setTimeout(() => {
				if (messageInputRef.current) {
					messageInputRef.current.focus();
				}
			}, 100);
		}
	}, [isOpen, collection]);

	const handleAddMessage = async () => {
		const raw = newMessageText.replace(/\r\n/g, "\n").replace(/[;,]+/g, "\n");
		const list = raw
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);

		if (!list.length) {
			toast.error(t("content.preparedMessages.messageTextRequired"));
			return;
		}

		const seen = new Set();
		const uniqueMessages = [];
		list.forEach((msg) => {
			if (!seen.has(msg)) {
				seen.add(msg);
				uniqueMessages.push(msg);
			}
		});

		try {
			setIsLoading(true);

			if (uniqueMessages.length === 1) {
				const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}/prepared_messages`, {
					method: "POST",
					body: {
						prepared_message: {
							text: uniqueMessages[0],
						},
					},
				});

				if (response?.data) {
					setNewMessageText("");
					loadMessages();
					toast.success(t("content.preparedMessages.messageAdded"));
				} else if (response?.errors) {
					toast.error(response.errors.join(", "));
				}
			} else {
				const payload = uniqueMessages.join("\n");
				const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}/prepared_messages/import`, {
					method: "POST",
					body: {
						messages: payload,
					},
				});

				if (response === null || response?.success !== false) {
					setNewMessageText("");
					loadMessages();
					toast.success(t("content.preparedMessages.messageAdded"));
				} else if (response?.errors || response?.error) {
					toast.error((response.errors && response.errors.join(", ")) || response.error);
				}
			}

			setTimeout(() => {
				if (messageInputRef.current) {
					messageInputRef.current.focus();
				}
			}, 0);
		} catch (error) {
			console.error("Error adding message:", error);
			toast.error(t("content.preparedMessages.addMessageError"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteMessage = async (messageId) => {
		try {
			setDeletingMessageId(messageId);
			const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}/prepared_messages/${messageId}`, {
				method: "DELETE",
			});

			if (response === null || !response?.error) {
				setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
				toast.success(t("content.preparedMessages.messageDeleted"));
			} else if (response?.error) {
				toast.error(response.error);
			}
		} catch (error) {
			console.error("Error deleting message:", error);
			toast.error(t("content.preparedMessages.deleteMessageError"));
		} finally {
			setDeletingMessageId(null);
		}
	};

	const handleUpdateTitle = async () => {
		if (!collectionTitle.trim()) {
			toast.error(t("content.preparedMessages.collectionTitleRequired"));
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}`, {
				method: "PATCH",
				body: {
					prepared_message_collection: {
						title: collectionTitle.trim(),
					},
				},
			});

			if (response?.data) {
				setEditingTitle(false);
				onUpdate();
				toast.success(t("content.preparedMessages.collectionUpdated"));
			} else if (response?.errors) {
				toast.error(response.errors.join(", "));
			}
		} catch (error) {
			console.error("Error updating collection:", error);
			toast.error(t("content.preparedMessages.updateError"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteCollection = async () => {
		try {
			setIsDeleting(true);
			const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}`, {
				method: "DELETE",
			});

			if (response === null || !response?.error) {
				toast.success(t("content.preparedMessages.collectionDeleted"));
				onDelete();
			} else if (response?.error) {
				toast.error(response.error);
			}
		} catch (error) {
			console.error("Error deleting collection:", error);
			toast.error(t("content.preparedMessages.deleteError"));
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		setNewMessageText("");
		setEditingTitle(false);
		setCollectionTitle(collectionData?.title || "");
		onClose();
	};

	return (
		<Modal isOpen={isOpen} toggle={handleClose} fade={true} centered={true} backdrop={true} className="prepared-messages-modal" backdropClassName="prepared-messages-modal-backdrop">
			<div className="prepared-messages-modal-content-wrapper">
				<div className="prepared-messages-modal-header">
					{editingTitle ? (
						<div className="prepared-messages-modal-title-edit">
							<input
								type="text"
								className="prepared-messages-form-input"
								value={collectionTitle}
								onChange={(e) => setCollectionTitle(e.target.value)}
								onBlur={handleUpdateTitle}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleUpdateTitle();
									} else if (e.key === "Escape") {
										setCollectionTitle(collectionData?.title || "");
										setEditingTitle(false);
									}
								}}
								autoFocus
							/>
						</div>
					) : (
						<div className="prepared-messages-modal-title-wrapper" onClick={() => setEditingTitle(true)}>
							<h2 className="prepared-messages-modal-title">{collectionData?.title || ""}</h2>
							<EditIcon className="prepared-messages-modal-title-edit-icon" width={16} height={16} />
						</div>
					)}
					<div className="prepared-messages-modal-header-actions">
						<button className="prepared-messages-modal-delete-collection-btn" type="button" onClick={handleDeleteCollection} disabled={isDeleting} title={t("content.preparedMessages.deleteCollection")}>
							<DeleteIcon width={18} height={18} />
						</button>
						<button className="prepared-messages-modal-close" type="button" onClick={handleClose}>
							<CloseIcon width={20} height={20} />
						</button>
					</div>
				</div>
				<div className="prepared-messages-modal-content">
					<div className="prepared-messages-collection-description">
						<p className="prepared-messages-collection-description-text">{t("content.preparedMessages.collectionDescription")}</p>
					</div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
						}}
						className="prepared-messages-add-message-form"
					>
						<div className="prepared-messages-form-group">
							<textarea ref={messageInputRef} className="prepared-messages-form-input prepared-messages-form-input-textarea" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} placeholder={t("content.preparedMessages.addMessagePlaceholder")} disabled={isLoading} rows={4} />
						</div>
						<div className="prepared-messages-add-message-actions">
							<button type="button" className="prepared-messages-add-message-btn" onClick={handleAddMessage} disabled={isLoading || !newMessageText.trim()}>
								{isLoading ? t("content.preparedMessages.saving") : t("content.preparedMessages.add")}
							</button>
						</div>
					</form>

					<div className="prepared-messages-messages-list">
						{isLoading && messages.length === 0 && <div className="prepared-messages-loading">{t("content.preparedMessages.loading")}</div>}
						{!isLoading && messages.length === 0 && <div className="prepared-messages-empty">{t("content.preparedMessages.noMessages")}</div>}
						{!isLoading &&
							messages.length > 0 &&
							messages.map((message) => (
								<div key={message.id} className="prepared-messages-message-item">
									<span className="prepared-messages-message-text">{message.attributes?.text || ""}</span>
									<button type="button" className="prepared-messages-message-delete-btn" onClick={() => handleDeleteMessage(message.id)} disabled={deletingMessageId === message.id} title={t("content.preparedMessages.deleteMessage")}>
										<CloseIcon width={14} height={14} />
									</button>
								</div>
							))}
					</div>
				</div>
			</div>
		</Modal>
	);
};

CollectionModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	collection: PropTypes.object.isRequired,
	onUpdate: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default CollectionModal;
