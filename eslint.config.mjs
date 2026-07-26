import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    ignores: ['eslint.config.js', 'dist', 'node_modules'],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  {
    plugins: {
      'unused-imports': eslintPluginUnusedImports,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // remove unused imports
      'unused-imports/no-unused-imports': 'error',

      // unused variables
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // console در Nest معمولا بهتره آزاد باشد
      'no-console': 'off',
    },
  }
);
