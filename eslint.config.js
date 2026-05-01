
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';=
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    ignores: ['eslint.config.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    plugins: {
      'unused-imports': eslintPluginUnusedImports
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',           // 💡 اضافه شد
        tsconfigRootDir: import.meta.dirname, // مسیر tsconfig
        allowDefaultProject: true             // ✅ اینجا درست اعمال شده
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'unused-imports/no-unused-imports': 'error',
      'no-console': 'error'
    }
  }
);
