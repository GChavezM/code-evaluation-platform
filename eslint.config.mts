import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/.vite/**',
      '**/coverage/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
        allowDefaultProject: true,
        project: [
          './tsconfig.base.json',
          './apps/frontend/tsconfig.app.json',
          './apps/frontend/tsconfig.node.json',
          './apps/backend/tsconfig.json',
        ],
      },
    },
  },

  // Frontend (React + Vite) configuration
  {
    files: ['apps/frontend/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // Backend (Node.js) configuration
  {
    files: ['apps/backend/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
]);
