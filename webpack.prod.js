const webpack = require("webpack");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new ReplaceInFileWebpackPlugin([{
      dir: 'dist',
      files: ['manifest.json'],
      rules: [
        {
          search: /"content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'",/,
          replace: ''
        }
      ]
    }]),
    new ZipPlugin({
      path: '../',
      filename: 'cotoami-scraper.zip'
    })
  ]
});
