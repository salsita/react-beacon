import merge from 'webpack-merge';
import { sharedConfig as webpackSharedConfig } from './webpack.config.babel';

export default (config) => {
  config.set({
    frameworks: ['mocha'],
    browsers: ['Chrome'],
    reporters: ['nyan', 'junit'],
    files: [
      'test/**/*.test.js'
    ],
    webpack: merge(webpackSharedConfig, {
      module: {
        noParse: [
          /node_modules\/sinon\//,
        ]
      },
      resolve: {
        alias: {
          'sinon': 'sinon/pkg/sinon'
        }
      },
      externals: {
        'jsdom': 'window',
        'cheerio': 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      },
      devtool: 'inline-source-map'
    }),
    preprocessors: {
      'test/**/*.test.js': ['webpack', 'sourcemap']
    },
    plugins: [
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-mocha'),
      require('karma-chrome-launcher'),
      require('karma-nyan-reporter'),
      require('karma-junit-reporter')
    ]
  });
};
