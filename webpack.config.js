'use strict';

const path = require('path');

module.exports = {
    entry: './src',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'GoDojoSGF.bundle.js'
    }
}
