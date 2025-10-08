import pluginJs from "@eslint/js";
// import perfectionist from 'eslint-plugin-perfectionist'
import globals from "globals";
import tseslint from "typescript-eslint";

// get help from https://github.com/Suyashtnt/personal-website/blob/master/eslint.config.js
export default [
  {
    ignores: [
      ".output/**/*",
      ".vinxi/**/*",
      "node_modules/**/*",
      "src/components/master_ui/core/**/*",
    ],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.cjs"],
  },
  // perfectionist.configs['recommended-natural'],
];
