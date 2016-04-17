module.exports = function( config ) {
  config.set( {
    basePath: "",
    frameworks: [ "jasmine" ],
    files: [
      "https://code.jquery.com/jquery-2.1.4.js",
      "https://cdn.jsdelivr.net/jasmine.jquery/2.0.3/jasmine-jquery.js",
	  "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.9.0/lodash.min.js",
	  "node_modules/promise-polyfill/promise.min.js",
    //   "src/**/*.js",
    //   "src/**/*.spec.js",
	  "lib/**/*.js",
	  "lib/**/*.spec.js"
    ],
    exclude: [
      "src/1-jquery/**/*.js",
	  "src/2-jquery-testable/**/*.js"
    ],
    preprocessors: {
      'src/**/!(*.spec).js': [ "coverage" ]
    },
    reporters: [ "spec" ],
    coverageReporter: {
      reporters: [
        { type: "html" },
        { type: "text-summary" }
      ],
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [ "PhantomJS" ], //, "Chrome" ],
    singleRun: false,
    concurrency: Infinity
  } );
};
