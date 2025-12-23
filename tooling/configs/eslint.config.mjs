import js from '@eslint/js';
import prettierConfigs from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  ts.configs.recommended,
  prettierConfigs,

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          modifiers: ['exported'],
          format: ['PascalCase'],

          filter: {
            regex: '^[A-Z]',
            match: true,
          },
        },
        {
          selector: 'class',
          modifiers: ['exported'],
          format: ['PascalCase'],
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx,mts,cts,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },

    plugins: {
      unusedImports,
      unicorn,
    },

    rules: {
      'no-void': [
        'error',
        {
          allowAsStatement: true,
        },
      ],

      'no-console': 'error',
      'no-useless-constructor': 'off',
      'no-unused-vars': 'off',

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/bin/**'],
              message:
                "Importing from 'bin' directory is not allowed. This directory is reserved for executable scripts.",
            },
            {
              group: [
                '**/src/**',
                '!@packages/ui/src/**',
                '!@packages/dom-parser/src/**',
                '!@packages/dom-translator/src/**',
                '!@packages/language-switcher/src/**',
              ],

              message: "Importing from external 'src' directories is not allowed.",
            },
          ],
        },
      ],
      'no-duplicate-imports': 'error',
      'import/first': 'off',
    },
  },
  globalIgnores(['out/*', 'node_modules/*', 'dist/*', '**/*.d.ts', '.prettierrc.js', '*.config.ts']),
  {
    files: ['*/bin/**'],
    rules: {
      'no-console': 'off',
    },
  }
);
