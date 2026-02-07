import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "reactstrap";
import { useTranslation } from "next-i18next";
import fetchWithToken from "services/fetchWithToken";
import EditIcon from "assets/img/icons/EditIcon";
import CreateCollectionModal from "./CreateCollectionModal";
import CollectionModal from "./CollectionModal";

import "assets/scss/ChatPage/PreparedMessages.scss";

const PreparedMessages = ({ setMessage, textareaRef, onSendPreparedMessage }) => {
	const { t } = useTranslation("chatPage");
	const [isLoading, setIsLoading] = useState(false);
	const [collections, setCollections] = useState([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedCollection, setSelectedCollection] = useState(null);
	const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

	const getCollections = async () => {
		try {
			setIsLoading(true);
			const response = await fetchWithToken("/api/v1/prepared_message_collections");
			if (response?.data) {
				setCollections(response.data);
			}
		} catch (error) {
			console.error("Error getting collections:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getCollections();
	}, []);

	const handleCreateCollection = () => {
		setIsCreateModalOpen(true);
	};

	const handleCollectionCreated = () => {
		setIsCreateModalOpen(false);
		getCollections();
	};

	const handleCollectionClick = async (collectionId) => {
		if (isEditMode) {
			// Режим редагування - відкрити модалку
			try {
				const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}`);
				if (response?.data) {
					setSelectedCollection(response);
					setIsCollectionModalOpen(true);
				}
			} catch (error) {
				console.error("Error getting collection:", error);
			}
		} else {
			// Звичайний режим - вибрати випадкове повідомлення і відправити його
			try {
				const response = await fetchWithToken(`/api/v1/prepared_message_collections/${collectionId}/prepared_messages`);
				if (response?.data && response.data.length > 0) {
					const messages = response.data;
					const randomMessage = messages[Math.floor(Math.random() * messages.length)];
					const messageText = randomMessage.attributes?.text || "";
					if (messageText) {
						if (onSendPreparedMessage) {
							onSendPreparedMessage(messageText);
						} else if (setMessage) {
							setMessage(messageText);
							if (textareaRef?.current) {
								setTimeout(() => {
									textareaRef.current?.focus();
								}, 0);
							}
						}
					}
				}
			} catch (error) {
				console.error("Error getting messages:", error);
			}
		}
	};

	const handleCollectionUpdated = () => {
		setIsCollectionModalOpen(false);
		setSelectedCollection(null);
		getCollections();
	};

	const handleCollectionDeleted = () => {
		setIsCollectionModalOpen(false);
		setSelectedCollection(null);
		getCollections();
	};

	return (
		<div className="prepared-messages-block">
			{!isLoading && (
				<div className="prepared-messages-collections">
					{collections.map((collection) => (
						<button key={collection.id} type="button" className={`prepared-message-collection ${isEditMode ? "prepared-message-collection-edit-mode" : ""}`} onClick={() => handleCollectionClick(collection.id)}>
							<span className="prepared-message-collection-title">{collection.attributes?.title || ""}</span>
						</button>
					))}
					{collections.length > 0 && (
						<button type="button" className={`prepared-message-collection prepared-message-collection-edit ${isEditMode ? "prepared-message-collection-edit-active" : ""}`} onClick={() => setIsEditMode(!isEditMode)} title={t("content.preparedMessages.toggleEditMode")}>
							<EditIcon width={20} height={20} />
						</button>
					)}
					<button type="button" className="prepared-message-collection prepared-message-collection-add" onClick={handleCreateCollection}>
						<span className="prepared-message-collection-add-icon">+</span>
					</button>
				</div>
			)}

			<CreateCollectionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCollectionCreated} />

			{selectedCollection && (
				<CollectionModal
					isOpen={isCollectionModalOpen}
					onClose={() => {
						setIsCollectionModalOpen(false);
						setSelectedCollection(null);
					}}
					collection={selectedCollection}
					onUpdate={handleCollectionUpdated}
					onDelete={handleCollectionDeleted}
				/>
			)}
		</div>
	);
};

PreparedMessages.propTypes = {
	setMessage: PropTypes.func,
	textareaRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
	onSendPreparedMessage: PropTypes.func,
};

PreparedMessages.defaultProps = {
	setMessage: null,
	textareaRef: null,
	onSendPreparedMessage: null,
};

export default PreparedMessages;
