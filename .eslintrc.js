module.exports = {
	parser: "@babel/eslint-parser",
	extends: ["airbnb-base", "plugin:prettier/recommended", "eslint:recommended", "plugin:@next/next/recommended"],
	settings: {
		react: {
			pragma: "React",
			version: "detect",
		},
		"import/resolver": {
			node: {
				paths: ["src"],
			},
		},
	},
	env: {
		browser: true,
		node: true,
		es2021: true,
	},
	plugins: ["prettier", "react"],
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	rules: {
		"react/jsx-uses-react": "error",
		"react/jsx-uses-vars": "error",
		quotes: ["error", "double"],
		"react/prefer-es6-class": ["error", "always"],
		"no-unused-vars": 0,
		"no-underscore-dangle": 0,
		"import/no-extraneous-dependencies": 0,
		"lines-around-directive": 0,
		strict: 0,
		"no-param-reassign": 0,
		"consistent-return": 0,
		"prefer-const": 0,
		"no-plusplus": 0,
		"prefer-destructuring": [
			"error",
			{
				array: false,
				object: true,
			},
			{
				enforceForRenamedProperties: false,
			},
		],
		"class-methods-use-this": [
			"error",
			{
				exceptMethods: ["render", "getInitialState", "getDefaultProps", "getChildContext", "componentWillMount", "componentDidMount", "componentWillReceiveProps", "shouldComponentUpdate", "componentWillUpdate", "componentDidUpdate", "componentWillUnmount"],
			},
		],
		"arrow-body-style": [2, "as-needed"],
		"default-param-last": 0,
		"no-console": 0,
		"max-len": [
			"error",
			{
				code: 350,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignorePattern: "^\\s*<|^\\s*\\{",
			},
		],
		"no-unexpected-multiline": "error",
		"react/prop-types": 1,
		"react/button-has-type": [
			"error",
			{
				button: true,
				submit: true,
				reset: true,
			},
		],
	},
};
