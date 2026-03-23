module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', '@vue/eslint-config-prettier'],
  rules: {
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 1, // максимум 1 атрибут на строку для однострочных тегов
        },
        multiline: {
          max: 1, // максимум 1 атрибут на строку для многострочных тегов
        },
      },
    ],
  },
};
