/* global module */

module.exports = function (config) {
    "use strict";

    config.set({
        basePath: '',
        // `phantomjs-shim` does have support for Function.prototype.bind
        frameworks: ['chai', 'mocha', 'phantomjs-shim'],
        files: [
            'src/**/*.js',
            'test/**/*.test.js'
        ],
        exclude: [
        ],
        preprocessors: {
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: [
            // 'Chrome',
            // 'Firefox',
            // 'Safari',
            'PhantomJS'
        ],
        singleRun: false
    });
};
