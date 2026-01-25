import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import "assets/scss/SingleComponents/PaginationBlock.scss";

const PaginationBlock = ({ pagination, func }) => {
	const { t } = useTranslation("dashboardPage");

	return (
		<div className="pagination">
			<div
				className={`pagination-btn ${pagination.page <= 1 ? "disabled" : ""}`}
				onClick={() => {
					if (pagination.page > 1) func(pagination.page - 1);
				}}
			>
				{`< ${t("pagination.prev")}`}
			</div>

			<span className="pagination-info">
				{t("pagination.page")} {pagination.page} {t("pagination.of")} {pagination.totalPages}
			</span>

			<div
				className={`pagination-btn ${pagination.page >= pagination.totalPages ? "disabled" : ""}`}
				onClick={() => {
					if (pagination.page < pagination.totalPages) func(pagination.page + 1);
				}}
			>
				{`${t("pagination.next")} >`}
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
};

export default PaginationBlock;
