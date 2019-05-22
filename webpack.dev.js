const webpack = require("webpack");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      COTOAMI_URL: JSON.stringify('http://localhost:4000')
    }),
    new ExtensionReloader()
  ]
});
