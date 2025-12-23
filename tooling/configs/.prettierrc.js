module.exports = {
  bracketSpacing: true,
  printWidth: 120,
  proseWrap: 'preserve',
  objectWrap: 'preserve',
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.json',
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['**/*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: '.*rc',
      options: {
        singleQuote: false,
        parser: 'json',
      },
    },
  ],
  plugins: ['prettier-plugin-organize-imports'],
};
