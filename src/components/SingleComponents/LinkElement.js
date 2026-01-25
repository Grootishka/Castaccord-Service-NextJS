import React from "react";
import { withRouter } from "next/router";
import Link from "next/link";

const LinkElement = withRouter(({ className, itemProp, openAnchor = () => {}, children, ...props }) => (
	<Link {...props} scroll={true} prefetch={false}>
		<a onClick={(e) => openAnchor(e, props.href)} className={className} itemProp={itemProp}>
			{children}
		</a>
	</Link>
));

export default LinkElement;
