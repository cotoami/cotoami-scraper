const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = {
  entry: {
    background: './src/background.js',
    options: './src/options.js',
    popup: './src/popup.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: "css-loader",
            options: {
              url: false,
              importLoaders: 1
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {}
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new ExtensionReloader()
  ]
};
