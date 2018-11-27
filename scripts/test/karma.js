const path = require('path');
const _ = require('lodash');
const getWebpackConfig = require('./webpack');

module.exports = function(config) {
    const { runAll } = config;
    const componentName = config.component ? _.kebabCase(config.component) : config.component;
    const testDir = `test/${componentName}`;
    const singleRun = runAll;
    const coveragePath = resolveCwd('coverage');
    const specPath = resolveCwd(testDir, '**/*-spec.js');

    const options = {
        frameworks: ['mocha'],
        browsers: ['Chrome'],
        customLaunchers: {
            ChromeTravis: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },
        reporters: ['spec', 'coverage'],
        preprocessors: {
            [specPath]: ['webpack', 'sourcemap'],
        },
        files: [
            path.join(__dirname, 'animation-polyfill.js'),
            require.resolve('babel-polyfill/dist/polyfill.js'),
            require.resolve('console-polyfill/index.js'),
            require.resolve('es5-shim/es5-shim.js'),
            require.resolve('es5-shim/es5-sham.js'),
            require.resolve('html5shiv/dist/html5shiv.js'),
            specPath
        ],
        coverageReporter: {
            dir: coveragePath,
            reporters: [
                { type: 'lcov', subdir: '.' },
                { type: 'text-summary', subdir: '.', file: 'coverage.txt' }
            ]
        },
        client: {
            mocha: {
                timeout: 4000,
                reporter: 'html',
                ui: 'bdd'
            }
        },
        hostname: 'localhost',
        browserNoActivityTimeout: 100000,
        port: 9877,
        colors: true,
        autoWatch: !singleRun,
        singleRun: singleRun,
        concurrency: Infinity,
        webpack: getWebpackConfig(componentName, runAll),
        webpackMiddleware: {
            stats: 'errors-only'
        },
        plugins: [
            'karma-chrome-launcher',
            'karma-mocha',
            'karma-webpack',
            'karma-spec-reporter',
            'karma-sourcemap-loader',
            'karma-coverage'
        ]
    };

    if (process.env.TRAVIS) {
        options.browsers = ['ChromeTravis'];
    }
    config.set(options);
};

function resolveCwd(...args) {
    args.unshift(process.cwd());
    return path.resolve(...args);
}
