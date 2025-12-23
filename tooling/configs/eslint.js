module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist/*', '**/*.d.ts'],
  plugins: ['@typescript-eslint', 'unused-imports', 'unicorn'],
  rules: {
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    'no-void': ['error', { allowAsStatement: true }],
    'no-useless-constructor': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'import/first': 'off',
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
    'no-console': 'error',
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-duplicate-imports': 'error',
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/types/*.ts', '**/web-components/*.ts', '**/*.context.ts'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: ['*/bin/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
