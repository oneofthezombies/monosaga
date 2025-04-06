import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import safeql from '@ts-safeql/eslint-plugin/config';
import 'dotenv/config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**/*'],
    languageOptions: { globals: { process: true } },
  },
  safeql.configs.connections({
    databaseUrl: process.env['DATABASE_URL'] ?? (() => {
      throw new Error('Please set DATABASE_URL env.');
    })(),
    targets: [{ wrapper: 'client.query' }, { wrapper: 'tx.query' }],
    overrides: { types: { jsonb: 'unknown' } },
  }),
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/max-len': ['error', {
        code: 80,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      '@stylistic/object-curly-newline': ['error', {
        ObjectExpression: {
          multiline: true,
          minProperties: 2,
        },
        ObjectPattern: {
          multiline: true,
          minProperties: 2,
        },
      }],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      }],
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
