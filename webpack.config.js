// webpack.config.js
//@ts-check

'use strict';
const path = require('path');

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/**
 * 1️⃣ BACKEND CONFIG — VS Code extension (Node.js)
 */
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

/**
 * 2️⃣ FRONTEND CONFIG — React WebView (runs in browser inside VS Code)
 */
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
        use: ['style-loader', 'css-loader', 'postcss-loader'] // needed for Tailwind
      }
    ]
  },
  devtool: 'source-map'
};

module.exports = [extensionConfig, webviewConfig];
