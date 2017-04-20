import Ember from 'ember';
import loginUser from './login-user';
import logoutUser from './logout-user';
import Application from '../../app';
import config from '../../config/environment';

const alreadyShownFactory = () => {
  let alreadyShown = [];
  return (msg, test, opt) => {
    if (test)
      return false;

    if( alreadyShown.indexOf(msg) === -1 ) {
      let warning = 'DEPRECATION: ' + msg;
      if(opt && opt.url) {
        warning += ' See: ' + opt.url;
      }
      console.warn(warning);
      alreadyShown.push(msg);
    }
  };
};
Ember.deprecate = alreadyShownFactory();
Ember.warn = alreadyShownFactory();

//see https://guides.emberjs.com/v2.3.0/configuring-ember/handling-deprecations/
Ember.Debug.registerDeprecationHandler((() => {
  let alreadyShown = [];
  return (message, options, next) => {
    // if(alreadyShown.indexOf(message) === -1) {
    if(false) {
      next(message, options);
      alreadyShown.push(message);
    }
  };
})());

export default function startApp(attrs) {
  let application;

  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  return application;
}
