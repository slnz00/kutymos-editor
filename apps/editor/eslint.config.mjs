import base from '@tooling/configs/eslint.config.mjs';
import react from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  ...base,
  {
    files: ['**/*.{ts,tsx,mts,cts,js}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
