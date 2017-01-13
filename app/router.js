import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('contact');
  this.route('about');

  // Menu Routes

  this.route('explore');
  this.route('search');
  this.route('compose');
  this.route('status');
  this.route('login');

  this.route('upload', function(){
    this.route('view', { path: '/view/:file_id' });
    this.route('edit', { path: '/edit/:file_id' });
    this.route('preview', { path: '/preview/:file_id' });
  });

  this.route('collaborators', function(){
    this.route('list', { path: '/' });
    this.route('view', { path: '/view/:user_id' });
  });

  // Data Routes

  this.route('nextcloud');


  this.route('collections', function(){
    this.route('list', { path: '/' });
    this.route('view', { path: '/view/:collection_id' });
    this.route('edit', { path: '/edit/:collection_id' });
    this.route('new');
  });

  this.route('data', function() {
    this.route('list', { path: '/:collection_id' });
  });
});

export default Router;
