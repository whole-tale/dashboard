/* jshint node: true */

module.exports = function() {
  return {
    moment: {
      // Options:
      // 'all' - all years, all timezones
      // '2010-2020' - 2010-2020, all timezones
      // 'none' - no data, just timezone API
      includeTimezone: 'all'
    }
  }
};

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'wholetale',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    torii: {
        providers: { /*....*/ }
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV['ember-cli-mirage'] = {
    enabled: false
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.apiHost = 'https://girder.wholetale.org';
    ENV.apiPath = '/api/v1';
    ENV.apiUrl = 'https://girder.wholetale.org/api/v1';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.apiHost = 'https://girder.wholetale.org';
    ENV.apiPath = '/api/v1';
    ENV.apiUrl = 'https://girder.wholetale.org/api/v1';
  }

  if (environment === 'production') {
    ENV.apiHost = 'https://girder.wholetale.org';
    ENV.apiPath = '/api/v1';
    ENV.apiUrl = 'https://girder.wholetale.org/api/v1';
  }

  return ENV;
};
