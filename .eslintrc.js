module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['coverage/'],
  rules: {
    // Not needed with React 17+ new JSX transform
    'react/react-in-jsx-scope': 'off',
    // Allow any quote style (backticks, single, or double)
    'quotes': 'off',
  },
};
