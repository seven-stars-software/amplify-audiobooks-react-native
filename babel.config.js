module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ["module:react-native-dotenv"],
    ["module-resolver",{
      root: ['./src'],
      extensions: [".ios.js", ".android.js", ".js", ".json", ".ts", ".tsx"],
      alias: {
        '@': './src',
        'navigators': './src/navigators',
        'screens': './src/screens',
        'contexts': './src/contexts',
        'stores': './src/stores',
        'components': './src/components',
        'styler': './src/styler',
        '@assets': './assets'
      }
    }]
  ]
};
