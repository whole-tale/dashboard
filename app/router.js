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

  this.route('nextcloud');
  this.route('data-upload');


  this.route('drives', function(){
    this.route('list', { path: '/' });
    this.route('view', { path: '/view/:collection_id' });
    this.route('edit', { path: '/edit/:collection_id' });
    this.route('new');
  });


});

export default Router;
