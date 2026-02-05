import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import "assets/scss/SingleComponents/PaginationBlock.scss";

const PaginationBlock = ({ pagination, func, namespace = "common", compact = false }) => {
	const { t, i18n } = useTranslation(namespace);
	const isCompactMode = compact && (i18n.language === "ua" || i18n.language === "ru");

	return (
		<div className="pagination">
			<div
				className={`pagination-btn ${pagination.page <= 1 ? "disabled" : ""}`}
				onClick={() => {
					if (pagination.page > 1) func(pagination.page - 1);
				}}
			>
				{isCompactMode ? "<" : `< ${t("pagination.prev")}`}
			</div>

			{!isCompactMode && (
				<span className="pagination-info">
					{t("pagination.page")} {pagination.page} {t("pagination.of")} {pagination.totalPages}
				</span>
			)}

			<div
				className={`pagination-btn ${pagination.page >= pagination.totalPages ? "disabled" : ""}`}
				onClick={() => {
					if (pagination.page < pagination.totalPages) func(pagination.page + 1);
				}}
			>
				{isCompactMode ? ">" : `${t("pagination.next")} >`}
			</div>
		</div>
	);
};

PaginationBlock.propTypes = {
	pagination: PropTypes.shape({
		page: PropTypes.number.isRequired,
		totalPages: PropTypes.number.isRequired,
	}),
	func: PropTypes.func.isRequired,
	namespace: PropTypes.string,
	compact: PropTypes.bool,
};

export default PaginationBlock;
