import eslint from "@eslint/js";
import safeql from "@ts-safeql/eslint-plugin/config";
import "dotenv/config";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**/*"],
    languageOptions: { globals: { process: true } },
  },
  safeql.configs.connections({
    databaseUrl:
      process.env["DATABASE_URL"] ??
      (() => {
        throw new Error("Please set DATABASE_URL env.");
      })(),
    targets: [{ wrapper: "client.query" }, { wrapper: "tx.query" }],
    overrides: { types: { jsonb: "unknown" } },
  }),
  eslint.configs.recommended,
  tseslint.configs.recommended
);
