const webpack = require("webpack");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new ReplaceInFileWebpackPlugin([{
      dir: 'dist',
      files: ['manifest.json'],
      rules: [
        {
          search: 'http://localhost:4000/',
          replace: 'https://cotoa.me/'
        },
        {
          search: /"content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'",/,
          replace: ''
        }
      ]
    }])
  ]
});
