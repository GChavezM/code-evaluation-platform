import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { Linter } from 'eslint';

const jsTyped = js as unknown as {
  configs: {
    recommended: { rules: Readonly<Linter.RulesRecord> };
    all: { rules: Readonly<Linter.RulesRecord> };
  };
};

const globalsTyped = globals as unknown as {
  browser: Record<string, boolean>;
  node: Record<string, boolean>;
};

const reactHooksTyped = reactHooks as {
  configs: {
    flat: {
      recommended: Linter.Config;
    };
  };
};

const reactRefreshTyped = reactRefresh as {
  configs: {
    vite: Linter.Config;
  };
};

const tsconfigRootDir = import.meta.dirname;

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/*.d.ts',
    '**/coverage/**',
    '.turbo/**',
  ]),

  jsTyped.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

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

  // Frontend (React + Vite) configuration
  {
    files: ['apps/frontend/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: {
        ...globalsTyped.browser,
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
    extends: [reactHooksTyped.configs.flat.recommended, reactRefreshTyped.configs.vite],
  },

  // Backend (Node.js) configuration
  {
    files: ['apps/backend/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: {
        ...globalsTyped.node,
      },
      parserOptions: {
        project: ['./apps/backend/tsconfig.json'],
        tsconfigRootDir,
      },
    },
  },
  eslintConfigPrettier,
]);
