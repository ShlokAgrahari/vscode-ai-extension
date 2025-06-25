// webpack.config.js
//@ts-check

'use strict';
const path = require('path');

/** @typedef {import('webpack').Configuration} WebpackConfig **/


const extensionConfig = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log',
  }
};


const webviewConfig = {
  target: 'web',
  mode: 'development',
  entry: './src/webview/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'media'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'] 
      }
    ]
  },
  devtool: 'source-map'
};

module.exports = [extensionConfig, webviewConfig];
