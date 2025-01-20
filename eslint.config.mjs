import path from 'node:path';
import { fileURLToPath } from 'node:url';

import babelParser from '@babel/eslint-parser';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      'dist/',
      'dist-for-testing/',
      'tmp/',
      'node_modules/',
      '!**/.*',
      '**/.*/',
      'src/blueprints/',
      'tests/fixtures/',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:import/recommended',
      'plugin:n/recommended',
      'plugin:prettier/recommended',
    ),
  ),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    languageOptions: {
      parser: babelParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        requireConfigFile: false,
      },
    },

    rules: {
      curly: 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
  {
    files: ['**/*.{cjs,js}'],

    rules: {
      'import/no-duplicates': 'error',
    },
  },
  ...fixupConfigRules(compat.extends('plugin:n/recommended')).map((config) => ({
    ...config,
    files: ['./.eslintrc.{cjs,js}', './.prettierrc.{cjs,js}'],
  })),
  {
    files: ['./.eslintrc.{cjs,js}', './.prettierrc.{cjs,js}'],

    languageOptions: {
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, 'off']),
        ),
        ...globals.node,
      },
    },
  },
  {
    files: ['bin/**/*.{js,ts}'],

    rules: {
      'n/hashbang': 'off',
    },
  },
];
