import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const tsconfigRootDir = import.meta.dirname;

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/*.d.ts',
    '**/coverage/**',
    '.turbo/**',
    '**/src/generated/**',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['eslint.config.mts'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mts'],
        },
        tsconfigRootDir,
      },
    },
  },

  {
    files: ['apps/backend/prisma.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['apps/backend/prisma.config.ts', 'eslint.config.mts'],
        },
        tsconfigRootDir,
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

      parserOptions: {
        project: [
          './apps/frontend/tsconfig.app.json',
          './apps/frontend/tsconfig.json',
          './apps/frontend/tsconfig.node.json',
        ],
        tsconfigRootDir,
      },
    },
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      tseslint.configs.recommendedTypeChecked,
    ],
  },

  // Backend (Node.js) configuration
  {
    files: ['apps/backend/src/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: ['./apps/backend/tsconfig.json'],
        tsconfigRootDir,
      },
    },
    extends: [tseslint.configs.recommendedTypeChecked],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  eslintConfigPrettier,
]);
