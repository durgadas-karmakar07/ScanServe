import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['node_modules'] },
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      // Express error handlers need 4 arguments even when `next` is unused; prefix it with `_`.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // console.log must not be committed (Rules.md section 7); info/warn/error are real logs.
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    },
  },
]);
