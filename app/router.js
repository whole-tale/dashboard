import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('contact');
  this.route('about');

  // Data Routes

  this.route('search');
  this.route('research');

  // Data Routes

  this.route('owncloud');
  this.route('data-upload');


});

export default Router;
