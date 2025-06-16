import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // This block specifically targets your rules to disable
    rules: {
      // Disable the rule for requiring specific types instead of 'any'
      "@typescript-eslint/no-explicit-any": "off",

      // Disable the rule for unused variables/imports
      // It's good practice to disable the base ESLint rule when using the TypeScript one
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Disable the rule that prevents using 'var'
      "no-var": "off",
    },
  },
];

export default eslintConfig;