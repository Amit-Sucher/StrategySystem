const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    draw: './src/draw.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      filename: 'draw.html',
      template: './public/draw.html',
      chunks: ['draw'],
    }),
  ],
  devServer: {
    contentBase: './build',
  },
};
