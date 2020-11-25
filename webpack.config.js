
module.exports = {
  // メインとなるJavaScriptファイル（エントリーポイント）
  entry: `./src/index.js`,
  // mode: `development`,
  mode: `production`,
  output: {
    path: `${__dirname}/dist`,
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader", //htmlに注入する
          "css-loader", //jsにバンドル
          "sass-loader", //sass→css
        ],
      },
    ],
  },
};
