const path = require('path');
const webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const CopyPlugin = require('copy-webpack-plugin');

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
    new webpack.DefinePlugin({
      COTOAMI_URL: JSON.stringify('http://localhost:4000')
    }),
    new VueLoaderPlugin(),
    new ExtensionReloader(),
    new CopyPlugin([
      { from: 'static' }
    ])
  ]
};
