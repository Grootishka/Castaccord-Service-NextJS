import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import "assets/scss/SingleComponents/ScrollableWrapper.scss";

const ScrollableWrapper = ({ additionalClassName, children }) => {
	const [offsetScroll, setOffsetScroll] = useState(0);

	const listRef = useRef();
	const blockShadowRef = useRef();
	const scrollAbleListRef = useRef();

	const controlEndList = ({ target }) => {
		const el = blockShadowRef.current;
		const isEnd = Math.abs(listRef.current.clientHeight - (target.scrollTop + target.clientHeight)) < 1;
		const isTop = target.scrollTop === 0;

		if (isEnd) {
			el.classList.add("without-shadow-down");
		} else {
			el.classList.remove("without-shadow-down");
		}

		if (isTop) {
			el.classList.add("without-shadow-top");
		} else {
			el.classList.remove("without-shadow-top");
		}

		setOffsetScroll(target.scrollTop);
	};

	useEffect(() => {
		const currentClassName = blockShadowRef.current.className;
		const isEnd = listRef.current.clientHeight < blockShadowRef.current.clientHeight;
		const isTop = listRef.current.scrollTop === 0;

		if (isEnd) {
			blockShadowRef.current.className = `${currentClassName} without-shadow-down`;
		}

		if (isTop) {
			blockShadowRef.current.className = `${currentClassName} without-shadow-top`;
		}
	}, []);

	useEffect(() => {
		scrollAbleListRef.current.scrollTop = offsetScroll;
	}, [children]);

	return (
		<div ref={blockShadowRef} className={`scrollable-wrap ${additionalClassName}`}>
			<div ref={scrollAbleListRef} onScroll={controlEndList} className="carousel-con">
				<div ref={listRef} className="items-list">
					{children}
				</div>
			</div>
		</div>
	);
};

ScrollableWrapper.propTypes = {
	children: PropTypes.node,
	additionalClassName: PropTypes.string,
};

export default ScrollableWrapper;
