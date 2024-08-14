module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
    "plugin:react/recommended",  // This is important for React
  ],
  settings: {
    react: {
      version: "detect",  // Automatically detects the React version
    },
  },
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    "no-undef": "off", // Turn off this rule for testing
  },
  globals: {
    require: "readonly",
    module: "readonly",
    exports: "readonly",
    convertedFilePath: "writable",  // Explicitly define convertedFilePath
  },
};
