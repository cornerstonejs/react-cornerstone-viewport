const path = require('path');

module.exports = {
  components: 'src/components/**/*.js',
  webpackConfig: {
    module: {
      rules: [
        // Babel loader, will use your project’s .babelrc
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.styl$/,
          loader: "style-loader!css-loader!stylus-loader",
          include: path.resolve(__dirname, "../")
        },
        // Other loaders that are needed for your components
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader?modules'
        }
      ]
    }
  }
}
