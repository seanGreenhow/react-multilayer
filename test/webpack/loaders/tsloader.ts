export default (config: string = "tsconfig.json") => ({
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: '/node_modules/',
    options: {
        configFile: config
    }
})