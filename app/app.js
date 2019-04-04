/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
import Ember from 'ember';
import DS from 'ember-data';
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import './models/custom-inflector-rules';
import moment from 'moment';

// Ember.MODEL_FACTORY_INJECTIONS = true;

// See https://stackoverflow.com/a/26413602 for debugging tips

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  // Basic logging, e.g. "Transitioned into 'post'"
  LOG_TRANSITIONS: true,

  // Extremely detailed logging, highlighting every internal
  // step made while transitioning into a route, including
  // `beforeModel`, `model`, and `afterModel` hooks, and
  // information about redirects and aborted transitions
  LOG_TRANSITIONS_INTERNAL: true,
  
  // Log view lookups / resolutions
  LOG_VIEW_LOOKUPS:          true,
  Resolver
});

loadInitializers(App, config.modulePrefix);

let handleError = (error) => {
  if (console.error) {
    console.error("Ember.js encountered an error:", error);
  } else {
    console.log("Ember.js encountered an error:", error);
  }
}

// Log general errors
Ember.onerror = (error) => { handleError(error); };

// Log any errors in runloop
Ember.run.backburner.DEBUG = true;

// Log any errors in RSVP Promises
Ember.RSVP.on('error', (error) => { handleError(error); });

console.log("The app is running in " + config.environment + " mode");
console.log("The API is " + config.apiUrl);
export default App;
