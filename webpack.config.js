const path = require('path')
const { Configuration } = require('webpack')

/** @type { Configuration } */
module.exports = {
  mode: 'production',
  entry: './src/content.ts',
  resolve: {
    extensions: ['.js', '.ts'],
  },
  output: {
    filename: 'content.js',
    path: path.resolve(__dirname, 'build/dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
}
