import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['**/*/dist/'],
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },
);
