export default {
    test: /\.(png|jpg|jpeg)$/,
    use: [{
        loader: 'file-loader',
        options: {
            name: '[name].[ext]',
            outputPath: 'img/'
        }
    }]
}