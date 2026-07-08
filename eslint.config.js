import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  prettier,

  {
    files: ['**/*.{js,ts,vue}'],

    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],

      'vue/multi-word-component-names': 'off',

      'no-unused-vars': 'error',
    },
  },
];
