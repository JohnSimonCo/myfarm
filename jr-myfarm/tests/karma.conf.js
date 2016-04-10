// Karma configuration
// Generated on Thu Jul 02 2015 11:16:57 GMT+0100 (W. Europe Standard Time)
'use strict';
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // default libs
      'js/jquery.js',
      'js/angular.js',
      'js/angular-mocks.js',
      'js/angular-route.js',
      'js/angular-cookies.js',
      'js/angular-touch.js',
      'js/angular-animate.js',

      'jr-myfarm/js/lib/jr1.js',
      'jr-myfarm/js/app.js',
      'jr-myfarm/js/lib/*.js',
      'jr-myfarm/js/*.js',

      'jr-myfarm/js/lib/polyfill.js',
      'jr-myfarm/js/lib/j$.js',
      'jr-myfarm/js/lib/server.js',
      'jr-myfarm/js/lib/util.js',
      'jr-myfarm/js/lib/emoji.js',
      'jr-myfarm/js/lib/translate.js',
      'jr-myfarm/js/lib/modal.js',
      'jr-myfarm/js/lib/escape-html.js',
      'jr-myfarm/js/lib/extract.js',
      'jr-myfarm/js/lib/password.js',
      'jr-myfarm/js/lib/cowq-extras.js',
      'jr-myfarm/js/lib/simple-graph.js',
      'jr-myfarm/js/lib/stat.js',
      'jr-myfarm/js/lib/page-visible.js',

      'jr-myfarm/js/lib/ngSilent.js',
      'jr-myfarm/js/myfarm.js',
      'jr-myfarm/js/overview.js',
      'jr-myfarm/js/overview-cowq.js',
      'jr-myfarm/js/overview-alarms.js',
      'jr-myfarm/js/overview-chat.js',
      'jr-myfarm/js/production.js',
      'jr-myfarm/js/robot-state.js',
      'jr-myfarm/js/settings.js',
      'jr-myfarm/js/version.js',
      'jr-myfarm/js/alarms.js',
      'jr-myfarm/js/chat.js',
      'jr-myfarm/js/cowq.js',
      'jr-myfarm/js/cow.js',
      'jr-myfarm/js/farms.js',
      'jr-myfarm/js/users.js',
      'jr-myfarm/js/edit-user.js',

      // to be tested
      'jr-myfarm/tests/unit_tests/*.js',
      'jr-myfarm/tests/unit_tests/**/*.js'

    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // source files must be a literal string
      'jr-myfarm/js/lib/*.js': ['coverage'],
      'jr-myfarm/js/*.js': ['coverage']
    },

    coverageReporter: {
      reporters: [
        { type: 'html', dir: 'jr-myfarm/tests/unit_tests_coverage'},
        { type: 'cobertura', dir: 'jr-myfarm/tests/unit_tests_coverage/cobertura'}
      ]
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress','junit','coverage'],


    proxies: {
      '/js/': '/base/jr-myfarm/js/',
      '/jr-myfarm/js/': '/base/jr-myfarm/js/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome', 'IE', 'Safari', 'Firefox'],
    browsers: ['PhantomJS'],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-coverage'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
};
