import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import vueParser from 'vue-eslint-parser';

export default [
  { ignores: ['dist/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,

  {
    files: ['**/*.{ts,vue}'],
    rules: {
      semi: ['error', 'always'],
      quotes: ['off'],
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: {
        ...globals.browser,
      },
    },
  },
];
