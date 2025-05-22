// eslint.config.js

const { defineConfig } = require("eslint/config");
const importPlugin = require("eslint-plugin-import");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,

  {
    ignores: ["dist/*"],

    plugins: {
      import: importPlugin,
    },

    rules: {
      "import/no-unresolved": "error", // or "warn" if you prefer
    },

    settings: {
      "import/resolver": {
        alias: {
          map: [["@env", "./.env"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
]);
