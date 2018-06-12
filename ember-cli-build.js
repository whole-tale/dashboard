/* global require, module */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const isTesting = process.env.EMBER_ENV === 'test';

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    hinting: !isTesting,
    sassOptions: {
      includePaths: ['app']
    },
    mediumEditorOptions: {
      theme: 'tim'
    },
    pretender: {
      enabled: true
    },
    'ember-cli-mocha': {
      useLintTree: false
    },
    'ember-cli-qunit': {
      useLintTree: false
    },
    'ember-2-legacy': {
      'ember-k': false,
      'safe-string': false,
      'enumerable-contains': false,
      'underscore-actions': false,
      'reversed-observer-args': false,
      'initializer-arity': false,
      'router-resouce': false,
      'current-when': false,
      'controller-wrapped': false,
      'application-registry': false,
      'immediate-observer': false,
      'string-fmt': false,
      'ember-freezable': false,
      'component-defaultLayout': false,
      'ember-binding': false,
      'input-transform': false,
      'deprecation-options': false,
      'orphaned-outlets': false,
      'warn-options': false,
      'resolver-function': false,
      'init-attrs': false,
      'render-support': false,
      'property-required': false
    },
    emberCliDropzonejs: {
      includeDropzoneCss: false
    }
  });
  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  return app.toTree();
};
