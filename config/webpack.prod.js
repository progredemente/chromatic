const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const commonConfig = require('./webpack.common');
const packageJson = require('../package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname,'../.env.production') });


const prodConfig = {
  mode: 'production',
  output: {
    filename: '[name].[contenthash].js',
    clean: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'chromatic',
      remotes: {
        components: `components@${process.env.COMPONENTS_URL}/remoteEntry.js`
      },
      shared: packageJson.dependencies
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      resourcesUrl: process.env.RESOURCES_URL
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new CopyWebpackPlugin({
        patterns: [
            {
                from: 'public',
                globOptions: {
                    ignore: ['**/*.html']
                }
            }
        ]
    })
  ],
};

module.exports = merge(commonConfig, prodConfig);
