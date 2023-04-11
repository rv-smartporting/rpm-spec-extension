/**@type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        requireConfigFile: false,
    },
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
        semi: [2, "always"],
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
    },
};
