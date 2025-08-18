const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      '*.min.js',
      '*.min.css',
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
    ],
  },
  {
    rules: {
      // Add any custom rules here
      'no-unused-vars': 'warn',
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];
