import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import safeql from '@ts-safeql/eslint-plugin/config';
import 'dotenv/config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**/*'],
    languageOptions: {
      globals: {
        process: true,
      },
    },
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },
  safeql.configs.connections({
    databaseUrl: process.env['DATABASE_URL'] ?? (() => {
      throw new Error('Please set DATABASE_URL env.');
    })(),
    targets: [{ wrapper: 'client.query' }, { wrapper: 'tx.query' }],
  }),
);
