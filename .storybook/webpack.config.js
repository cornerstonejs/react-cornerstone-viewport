const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.styl$/,
        loader: "style-loader!css-loader!stylus-loader",
        include: path.resolve(__dirname, "../")
      }
    ]
  }
};
