// eslint-disable-next-line @next/next/no-document-import-in-page
import { Head } from "next/document";
import React from "react";
import { readFileSync } from "fs";
import path from "path";

export default class CustomNextHead extends Head {
	static dedupe(bundles) {
		const files = new Set();
		const kept = [];
		bundles.forEach((bundle) => {
			if (files.has(bundle.file)) {
				return null;
			}
			files.add(bundle.file);
			kept.push(bundle);
		});
		return kept;
	}

	getCssLinks(files) {
		const { assetPrefix, dynamicImports } = this.context;
		const cssFiles = files.allFiles.filter((f) => f.endsWith(".css"));
		const sharedFiles = new Set(files.sharedFiles);
		let dynamicCssFiles = this.constructor.dedupe(dynamicImports.filter((f) => f.file.endsWith(".css"))).map((f) => f.file);
		if (dynamicCssFiles.length) {
			const existing = new Set(cssFiles);
			dynamicCssFiles = dynamicCssFiles.filter((f) => !(existing.has(f) || sharedFiles.has(f)));
			cssFiles.push(...dynamicCssFiles);
		}
		const cssLinkElements = [];
		cssFiles.forEach((file) => {
			const isSharedFile = sharedFiles.has(file);
			cssLinkElements.push(
				<style
					key={file}
					nonce={this.props.nonce}
					data-href={`${assetPrefix}/_next/${file}`}
					dangerouslySetInnerHTML={{
						__html: readFileSync(path.join(process.cwd(), ".next", file), "utf-8"),
					}}
					data-n-g={isSharedFile ? "" : undefined}
					data-n-p={isSharedFile ? undefined : ""}
				/>
			);
		});
		return cssLinkElements.length === 0 ? null : cssLinkElements;
	}

	// eslint-disable-next-line class-methods-use-this
	getPreloadDynamicChunks() {
		return [];
	}

	// eslint-disable-next-line class-methods-use-this
	getPreloadMainLinks() {
		return [];
	}
}
