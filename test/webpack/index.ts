import { resolve } from "path";
import tsloader from "./loaders/tsloader";
import imageloader from "./loaders/imageloader";
import fileloader from "./loaders/htmlloader";
import HtmlWebPackPlugin = require("html-webpack-plugin");
import webpack = require("webpack");

export default {
    entry: {
        test: './test'
    },
    output: {
        path: resolve(__dirname, '..', '..', 'build'),
        publicPath: '/',
        filename: '[name].js',
    },
    watchOptions: {
        aggregateTimeout: 500,
        ignored: [
            "/build/",
            "/node_modules/"
        ]
    },
    devServer: {
        port: 80,
        overlay: true,
        publicPath: '/'
    },
    module: {
        rules: [
            tsloader(),
            fileloader,
            imageloader
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: resolve(__dirname, '..', '..', 'index.html'),
            filename: "./index.html"
        })
    ],
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.json'],
    },
    devtool: "source-map"
} as webpack.Configuration