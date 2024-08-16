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
    "no-undef": "error", // Turn this back to "error" to enforce the rule
  },
  globals: {
    require: "readonly",
    module: "readonly",
    exports: "readonly",
    convertedFilePath: "writable",  // Explicitly define convertedFilePath
    process: "readonly", // Recognize process as a global variable
    __dirname: "readonly", // Recognize __dirname as a global variable
  },
};
