const webpack = require("webpack");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      COTOAMI_URL: JSON.stringify('https://cotoa.me')
    })
  ]
});
