module.exports = {
  extends: ['taro/react', 'alloy', 'alloy/react', 'alloy/typescript'],
  rules: {
    'no-new': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/no-empty-interface': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-nested-ternary': 'error',
    'max-lines': ['error', 500],
    'jsx-quotes': ['off', 'prefer-single'],
    '@typescript-eslint/consistent-type-imports': 'off',
  },
};
