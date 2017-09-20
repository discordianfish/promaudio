const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

const gitSHA = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

const gitTag = require('child_process')
  .execSync('git describe --always --tag --abbrev=0')
  .toString();

const gitBranch = require('child_process')
  .execSync('git rev-parse --abbrev-ref HEAD')
  .toString();

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: [
    './index.js',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    sourceMapFilename: '[name].js.map',
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'app'),
    historyApiFallback: true,
  },
  devtool: 'cheap-module-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'app'),
        ],
        query: {
          retainLines: true,
          presets: ['es2016'],
        },
      },
      {test: /\.html$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'},
      {
        test: /\.md$/,
        use: [
          {loader: 'html-loader'},
          {loader: 'markdown-loader'},
        ],
      },
      {
        test: /\.(jpe?g|png)$/i,
        loader: 'responsive-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
     // favicon: 'assets/images/favicon.png',
      template: path.join(__dirname, 'app', 'index.html.tmpl'),
    }),
    new webpack.DefinePlugin({
      __GIT_SHA__: JSON.stringify(gitSHA),
      __GIT_TAG__: JSON.stringify(gitTag),
      __GIT_BRANCH__: JSON.stringify(gitBranch),
    }),
    new AssetsPlugin({filename: path.join('dist', 'assets.json')}),
  ],
  resolve: {
    alias: {
      config: path.join(__dirname, 'config/main'),
    },
  },
};
