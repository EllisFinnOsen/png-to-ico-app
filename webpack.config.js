const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
        new webpack.ProvidePlugin({
            global: 'global', // Add global polyfill
        }),
    ],
    resolve: {
        fallback: {
            global: require.resolve('global'),
            path: require.resolve('path-browserify'), // Required for Electron compatibility
            fs: false, // Exclude `fs` in the renderer process
        },
    },
    target: 'web', // Use 'web' for renderer process compatibility
    devServer: {
        static: path.join(__dirname, 'dist'),
        port: 8080,
    },
};
