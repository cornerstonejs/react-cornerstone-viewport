const path = require('path');
const webpack = require('webpack');
// Plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENTRY_VIEWPORT = path.join(__dirname, './../src/index.js');
const ENTRY_EXAMPLES = path.join(__dirname, './../examples/index.js');
const SRC_PATH = path.join(__dirname, './../src');
const OUT_PATH = path.join(__dirname, './../dist');

module.exports = {
  entry: {
    examples: ENTRY_EXAMPLES,
  },
  devtool: 'source-map',
  output: {
    path: OUT_PATH,
    filename: '[name].bundle.[hash].js',
    library: 'cornerstoneViewport',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, './../node_modules'), SRC_PATH],
    alias: {
      '@cornerstone-viewport': ENTRY_VIEWPORT,
    },
  },
  plugins: [
    // Show build progress
    new webpack.ProgressPlugin(),
    // Clear dist between builds
    new CleanWebpackPlugin(),
    // Generate `index.html` with injected build assets
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '..', 'examples', 'index.html'),
    }),
  ],
  // Fix for `cornerstone-wado-image-loader` fs dep
  node: { fs: 'empty' },
  devServer: {
    hot: true,
    open: true,
    port: 3000,
    historyApiFallback: {
      disableDotRule: true,
    },
  },
};
