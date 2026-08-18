// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // `supabase/functions` draait op Deno (eigen globals, jsr:-imports); die code hoort
    // niet bij het Expo-project en wordt daarom ook door tsconfig uitgesloten.
    ignores: ["dist/*", "supabase/functions/*"],
  }
]);
