const path = require('path');
const webpack = require('webpack');
// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PUBLIC_URL = process.env.PUBLIC_URL || '/';
const ENTRY_VIEWPORT = path.join(__dirname, './../src/index.js');
const ENTRY_EXAMPLES = path.join(__dirname, './../examples/index.js');
const SRC_PATH = path.join(__dirname, './../src');
const OUT_PATH = path.join(__dirname, './../dist');

module.exports = {
  entry: {
    examples: ENTRY_EXAMPLES,
  },
  mode: 'development',
  devtool: 'eval',
  output: {
    path: OUT_PATH,
    filename: '[name].bundle.[hash].js',
    library: 'cornerstoneViewport',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true
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
    fallback: { fs: false, path: false },
  },
  plugins: [
    // Show build progress
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || '/'),
    }),
    // Uncomment to generate bundle analyzer
    // new BundleAnalyzerPlugin(),
    // Generate `index.html` with injected build assets
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '..', 'examples', 'index.html'),
      templateParameters: {
        PUBLIC_URL: PUBLIC_URL,
      },
    }),
  ],
  // Fix for `cornerstone-wado-image-loader` fs dep
  devServer: {
    hot: true,
    open: true,
    port: 3000,
    historyApiFallback: {
      disableDotRule: true,
    },
  },
};
