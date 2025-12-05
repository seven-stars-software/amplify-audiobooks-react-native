module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv'],
    ['module-resolver',{
      root: ['./src'],
      extensions: ['.ios.js', '.android.js', '.js', '.json', '.ts', '.tsx'],
      alias: {
        '@assets': './assets',
      },
    }],
  ],
};
