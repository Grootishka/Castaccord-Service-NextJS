import React, { useMemo, useState, useEffect } from "react";
import { Container } from "reactstrap";
import Image from "next/image";
import { toast } from "react-toastify";
import { withRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector, useDispatch } from "react-redux";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import fetchWithToken from "services/fetchWithToken";
import EditBotModal from "components/BotsListPage/EditBotModal";
import PaginationBlock from "components/SingleComponents/PaginationBlock";
import { deleteBot, editBot } from "redux/actions/mainActions";

import BlockIcon from "assets/img/icons/BlockIcon";
import WarningIcon from "assets/img/icons/WarningIcon";
import "assets/scss/BotsListPage/main.scss";

const BotsList = () => {
	const { t } = useTranslation("botsListPage");
	const { botAccounts } = useSelector((state) => state.main);
	const dispatch = useDispatch();

	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingBot, setEditingBot] = useState(null);
	const [editForm, setEditForm] = useState({ badgeId: null, color: "#FF0000" });
	const [currentPage, setCurrentPage] = useState(1);
	const [statusSortOrder, setStatusSortOrder] = useState("asc");
	const itemsPerPage = 10;

	const availableColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];

	const availableBots = useMemo(() => {
		const list = Array.isArray(botAccounts) ? botAccounts : [];

		const botsWithBadges = list
			.map((item) => {
				const attrs = item?.attributes || {};
				const badgesArr =
					attrs.available_badges?.map((badge) => ({
						id: badge.attributes.id,
						icon: badge.attributes.image_url_4x,
					})) || [];
				const badgesMap = badgesArr.reduce((acc, badge) => {
					acc[badge.id] = badge.icon;
					return acc;
				}, {});
				const badgesList = badgesArr.map((badge) => ({
					id: badge.id,
					icon: badge.icon,
				}));

				return {
					id: Number(attrs.id),
					username: attrs.username || "",
					status: attrs.status || "invalid",
					icon: badgesMap[attrs.selected_badge_id] || null,
					selected_badge_id: attrs.selected_badge_id || null,
					color: attrs.chat_color || "#FF0000",
					badgesList,
				};
			})
			.filter((b) => Number.isFinite(b.id));

		return botsWithBadges;
	}, [botAccounts]);

	const filteredBots = useMemo(() => {
		let filtered = [...availableBots];

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((bot) => {
				const username = bot.username?.toLowerCase() || "";
				const id = String(bot.id);
				const status = bot.status?.toLowerCase() || "";
				return username.includes(query) || id.includes(query) || status.includes(query);
			});
		}

		const statusOrder = { active: 0, pending: 1, banned: 2, invalid: 3 };
		return filtered.sort((a, b) => {
			const aOrder = statusOrder[a.status] ?? 5;
			const bOrder = statusOrder[b.status] ?? 5;
			if (aOrder !== bOrder) {
				return statusSortOrder === "asc" ? aOrder - bOrder : bOrder - aOrder;
			}
			return a.id - b.id;
		});
	}, [availableBots, searchQuery, statusSortOrder]);

	const totalPages = useMemo(() => Math.ceil(filteredBots.length / itemsPerPage), [filteredBots.length, itemsPerPage]);

	const paginatedBots = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredBots.slice(startIndex, endIndex);
	}, [filteredBots, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, statusSortOrder]);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [totalPages, currentPage]);

	const handlePageChange = (page) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleStatusSort = () => {
		setStatusSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
	};

	const handleEditBot = (bot) => {
		setEditingBot(bot);
		setEditForm({
			badgeId: bot.selected_badge_id ?? null,
			color: bot.color || "#FF0000",
		});
	};

	const handleCloseEdit = () => {
		setEditingBot(null);
		setEditForm({ badgeId: null, color: "#FF0000" });
	};

	const handleSaveEdit = async () => {
		if (!editingBot) return;

		setIsLoading(true);
		try {
			const body = {};

			const currentBadgeId = editingBot.selected_badge_id ?? null;
			if (editForm.badgeId !== currentBadgeId) {
				body.badge_id = editForm.badgeId;
			}

			if (editForm.color && editForm.color !== editingBot.color) {
				body.chat_color = editForm.color;
			}

			const response = await fetchWithToken(`/api/v1/bot_accounts/${editingBot.id}`, {
				method: "PUT",
				body,
			});

			if (response && response.success === false) {
				toast.error(response.error || t("messages.updateError"));
				return;
			}

			dispatch(editBot(editingBot.id, body));
			handleCloseEdit();
		} catch (error) {
			console.error("Error updating bot:", error);
			toast.error(t("messages.updateError"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteBot = async (botId) => {
		setIsLoading(true);
		try {
			await fetchWithToken(`/api/v1/bot_accounts/${botId}`, {
				method: "DELETE",
			});
			dispatch(deleteBot(botId));
		} catch (error) {
			console.error("Error deleting bot:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container>
			<div className="main-bots-list-block">
				<div className="bots-list-content-block">
					<div className="bots-list-header">
						<h1 className="bots-list-title">{t("title")}</h1>
						<div className="bots-list-search">
							<input type="text" className="bots-list-search-input" placeholder={t("searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
						</div>
					</div>

					<div className="bots-list-warning">
						<div className="bots-list-warning-icon">
							<WarningIcon width={48} height={48} />
						</div>
						<div className="bots-list-warning-content">
							<div className="bots-list-warning-title">{t("warning.title")}</div>
							<div className="bots-list-warning-message">{t("warning.message")}</div>
						</div>
					</div>

					<div className="bots-list-table-wrapper">
						<table className="bots-list-table">
							<thead>
								<tr>
									<th>{t("tableHeaders.icon")}</th>
									<th>{t("tableHeaders.username")}</th>
									<th>{t("tableHeaders.color")}</th>
									<th className="bots-list-sortable-header" onClick={handleStatusSort}>
										{t("tableHeaders.status")}
										<span className="bots-list-sort-icon">{statusSortOrder === "asc" ? "↑" : "↓"}</span>
									</th>
									<th>{t("tableHeaders.actions")}</th>
								</tr>
							</thead>
							<tbody>
								{!filteredBots.length && (
									<tr>
										<td colSpan="6" className="bots-list-empty">
											{t("empty")}
										</td>
									</tr>
								)}
								{!!filteredBots.length &&
									paginatedBots.map((bot) => (
										<tr key={bot.id}>
											<td>
												<div className="bots-list-icon">
													{bot.icon && <Image src={bot.icon} alt={bot.username} className="bots-list-icon-image" width={32} height={32} />}
													{!bot.icon && <BlockIcon className="bots-list-icon-svg" width={32} height={32} />}
												</div>
											</td>
											<td>{bot.username || t("botFallbackName", { id: bot.id })}</td>
											<td>
												<div className="bots-list-color-preview" style={{ backgroundColor: bot.color }} />
											</td>
											<td>
												<span className={`bots-list-status bots-list-status-${bot.status}`}>{t(`status.${bot.status}`)}</span>
											</td>
											<td>
												<div className="bots-list-actions">
													{bot.status !== "banned" && bot.status !== "invalid" && (
														<button className="bots-list-edit-btn" type="button" onClick={() => handleEditBot(bot)} disabled={isLoading}>
															{t("actions.edit")}
														</button>
													)}
													<button className="bots-list-delete-btn" type="button" onClick={() => handleDeleteBot(bot.id)} disabled={isLoading}>
														{t("actions.delete")}
													</button>
												</div>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>

					<div className="bots-list-footer">
						<p className="bots-list-count">{filteredBots.length === 1 ? t("footer.totalWithCount", { count: filteredBots.length }) : t("footer.totalWithCountPlural", { count: filteredBots.length })}</p>
						<p className="bots-list-count">{t("footer.totalActive", { count: filteredBots.filter((bot) => bot.status === "active").length })}</p>
						<p className="bots-list-count">{t("footer.totalBanned", { count: filteredBots.filter((bot) => bot.status === "banned").length })}</p>
						<p className="bots-list-count">{t("footer.totalInvalid", { count: filteredBots.filter((bot) => bot.status === "invalid").length })}</p>
						<p className="bots-list-count">{t("footer.totalPending", { count: filteredBots.filter((bot) => bot.status === "pending").length })}</p>
						{totalPages > 1 && <PaginationBlock pagination={{ page: currentPage, totalPages }} func={handlePageChange} />}
					</div>
				</div>
			</div>

			<EditBotModal isOpen={!!editingBot} onClose={handleCloseEdit} bot={editingBot} editForm={editForm} setEditForm={setEditForm} onSave={handleSaveEdit} isLoading={isLoading} availableColors={availableColors} />
		</Container>
	);
};

export const getServerSideProps = withSSRRedirect(async (param) => {
	const { locale, resolvedUrl } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["common", "botsListPage"])),
			locale,
			...getSEOOptions(resolvedUrl),
		},
	};
});

export default withRouter(BotsList);
