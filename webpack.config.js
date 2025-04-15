const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/app.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [ 
	    new Dotenv()
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts'],
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
