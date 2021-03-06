'use strict';

module.exports = function () {
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

module.exports = function (environment) {
  let ENV = {
    taleIconHeight: "360",
    taleIconWidth: "360",

    modulePrefix: 'wholetale',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    torii: {
      providers: { 
          
      }
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      },
      'ember-oauth2': {
        model: {}
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

  if (environment === 'test') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.apiHost = '';
    ENV.apiPath = '/api';
    ENV.apiUrl = '';
    ENV.dev = true;
    // ENV.APP.autoboot = false;
  }

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.apiHost = 'https://girder.dev.wholetale.org';
    ENV.wholeTaleHost = 'https://dashboard.dev.wholetale.org';
    ENV.dataOneHost = 'https://dev.nceas.ucsb.edu/knb/d1/mn/v2';
    ENV.authProvider = 'Globus';
    ENV.dev = true;
  }

  if (environment === 'production') {
    ENV.apiHost = 'apiHOST';
    ENV.wholeTaleHost = 'dashboardHOST';
    ENV.dataOneHost = 'dataOneHOST';
    ENV.authProvider = 'authPROVIDER';
    ENV.dev = 'dashboardDev';
  }

  ENV.apiPath = 'api/v1';
  ENV.apiUrl = ENV.apiHost + '/' + ENV.apiPath;
  ENV.authRedirect = ENV.wholeTaleHost + '/login-success';

  return ENV;
};

/*

https://auth.globus.org/v2/oauth2/authorize?access_type=online
    &state=iu9WwUYRo0QmGHTfiSO4PzgVIU5zFdXqbTHT5yciHvd1quMgUWdHMjv6anpWiw6c.http://localhost:4200?token={girderToken}
    &redirect_uri=https://girder.dev.wholetale.org:8080/api/v1/oauth/globus/callback
    &response_type=cod
    &client_id=724710b6-bb43-4803-a68e-b4133c34c599&scope=urn:globus:auth:scope:auth.globus.org:view_identities openid profile email
*/
