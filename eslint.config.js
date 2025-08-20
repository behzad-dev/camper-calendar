import vue from 'eslint-plugin-vue';
import prettier from '@vue/eslint-config-prettier/flat';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },

  ...vue.configs['flat/recommended'],

  prettier,

  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];
