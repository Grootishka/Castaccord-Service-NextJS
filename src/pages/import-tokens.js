import React, { useMemo, useState } from "react";
import { Container } from "reactstrap";
import { toast } from "react-toastify";
import { withRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import withSSRRedirect from "helpers/withSSRRedirect";
import getSEOOptions from "services/getSEOOptions";
import fetchWithToken from "services/fetchWithToken";

import "assets/scss/ImportTokensPage/main.scss";

const ImportTokens = () => {
	const { t } = useTranslation("importTokensPage");
	const importTokens = t("content", { returnObjects: true });

	const [isLoading, setIsLoading] = useState(false);
	const [tokensText, setTokensText] = useState("");

	const parsedTokens = useMemo(() => {
		const raw = tokensText.replace(/\r\n/g, "\n").replace(/[;,]+/g, "\n");

		const list = raw
			.split(/\s+/g)
			.map((s) => s.trim())
			.filter(Boolean);

		const seen = new Set();
		const unique = [];
		list.forEach((token) => {
			if (!seen.has(token)) {
				seen.add(token);
				unique.push(token);
			}
		});
		return unique;
	}, [tokensText]);

	const postImportTokens = async () => {
		setIsLoading(true);
		try {
			if (!parsedTokens.length) {
				toast.error("Paste at least one token.");
				return;
			}

			const invalid = parsedTokens.find((tkn) => tkn.length < 10 || /\s/.test(tkn));
			if (invalid) {
				toast.error("Token is invalid.");
				return;
			}

			const tokensPayload = parsedTokens.join("\n");

			await fetchWithToken("/api/v1/bot_accounts/import", {
				method: "POST",
				body: { tokens: tokensPayload },
			});

			toast.success("Tokens imported.");
			setTokensText("");
		} catch (e) {
			console.error(`Error in import tokens: ${e}`);
			toast.error("Something went wrong.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container>
			<div className="main-import-tokens-block">
				<div className="import-tokens-content-block">
					<p className="import-tokens-title">{importTokens?.title || ""}</p>
					<p className="import-tokens-description">{importTokens?.description || ""}</p>
					<div className="tokens-card">
						<p className="tokens-card-title">{importTokens?.tokensCardTitle || ""}</p>
						<p className="tokens-card-subtitle">{importTokens?.tokensCardSubtitle || ""}</p>
						<textarea className="tokens-textarea" value={tokensText} onChange={(e) => setTokensText(e.target.value)} placeholder={"abcdef123456...\nghijkl789012...\nmnopqr345678..."} spellCheck={false} />
						<button className="import-tokens-btn" type="button" onClick={postImportTokens} disabled={isLoading}>
							<p className="import-tokens-btn-text">{isLoading ? importTokens?.importingText : importTokens?.buttonText}</p>
						</button>
					</div>
				</div>
			</div>
		</Container>
	);
};

export const getServerSideProps = withSSRRedirect(async (param) => {
	const { locale, resolvedUrl } = param;

	return {
		props: {
			...(await serverSideTranslations(locale, ["common", "importTokensPage"])),
			locale,
			...getSEOOptions(resolvedUrl),
		},
	};
});

export default withRouter(ImportTokens);
