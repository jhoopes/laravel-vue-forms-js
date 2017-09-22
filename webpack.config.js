const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

module.exports = merge(require('./webpack.base'), {
    context: __dirname,

    entry: {
        'index': './src/index.js',
        'index.min': './src/index.js',
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'laravel-vue-forms',
        libraryTarget: 'umd',
    },

    externals: [
        'moment', 'vue', 'dropzone', 'vue-multiselect', 'tempusdominus-bootstrap-3', 'axios', 'jquery', 'sizzle'
    ],

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
        }),
    ],
});
