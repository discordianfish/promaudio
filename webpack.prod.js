const webpack = require('webpack');
const Merge = require('webpack-merge');

const CommonConfig = require('./webpack.config.js');

module.exports = Merge(CommonConfig, {
  devtool: 'cheap-module-source-map',
  plugins: [
    // Appears to be needed even though we set NODE_ENV outside which again is
    // needed for babel.
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
  ],
});
