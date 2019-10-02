const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const path = require('path');
const configuration = require('./webpack.config');

if (process.argv.length > 2) {
    if (process.argv[2] == 'build') {
        configuration.mode = 'production';
    } else {
        configuration.mode = 'development';
        configuration.output.path = path.resolve(__dirname, 'demo');
    }

    const compiler = webpack(configuration);
    if (process.argv[2] == 'build') {
        compiler.run((err, stats) => {
            if (err) {
                console.log(err);
            }
        });
    } else {
        const devServerOptions = Object.assign({}, configuration.devServer, {
            stats: {
              colors: true,
            },
            hot: true,
            contentBase: path.join(__dirname, '/demo')
        });
        const devServer = new webpackDevServer(compiler, devServerOptions);
        devServer.listen(8080, '127.0.0.1', () => {
            console.log('dev server running on http://127.0.0.1:8080')
        });
    }
}
