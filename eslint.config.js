const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'templates/',
      '*.md',
      '.prettierrc',
      '.eslintrc.json',
    ],
  },
];
