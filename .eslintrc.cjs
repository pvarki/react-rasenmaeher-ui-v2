/**
 * ESLint configuration for the React/TypeScript project.
 *
 * This configuration follows recommendations from the TypeScript ESLint plugin
 * and integrates Prettier to ensure consistent formatting.  It also enforces
 * import order and warns about unused variables and explicit `any` types.
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    // Delegate formatting concerns to Prettier
    "prettier/prettier": ["warn", { endOfLine: "auto" }],
    // Warn about unused variables but ignore args prefixed with `_`
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // Discourage usage of `any`
    "@typescript-eslint/no-explicit-any": "warn",
    // Maintain a consistent import ordering
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
      },
    ],
    // Prefer trailing commas where valid in ES5 (objects, arrays, etc.)
    "comma-dangle": ["warn", "always-multiline"],
    // Avoid leaving debugging code in production
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  ignorePatterns: ["dist", "node_modules"],
};
