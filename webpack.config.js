const path = require('path');

module.exports = {
  mode: 'development', // Change to development for easier debugging
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'src'), // Output directly to src folder
    filename: 'main.bundle.js',
    clean: false, // Don't clean to avoid removing other files
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  target: 'electron-renderer',
  devtool: 'source-map', // Add source maps for debugging
};