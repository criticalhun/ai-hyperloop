// backend/.eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Itt lehet egyéni szabályokat megadni, de az alap ajánlott beállítások jó kiindulópontot jelentenek.
  },
};
