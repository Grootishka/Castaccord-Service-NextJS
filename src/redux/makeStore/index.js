import { composeWithDevTools } from "@redux-devtools/extension";
import { createWrapper } from "next-redux-wrapper";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";

import rootReducer from "redux/reducers";

const composedMiddlewares = applyMiddleware(thunk);

const storeEnhancers = composeWithDevTools({
	name: "StreamChatHub-NextJS",
})(composedMiddlewares);

const makeStore = () => createStore(rootReducer, storeEnhancers);

export default createWrapper(makeStore);
