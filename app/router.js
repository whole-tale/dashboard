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
  this.route('recipe-image');
  this.route('status');
  this.route('login');

  this.route('upload', function(){
    this.route('view', { path: '/view/:file_id' });
    this.route('edit', { path: '/edit/:file_id' });
    this.route('preview', { path: '/preview/:file_id' });
  });

  this.route('catalog', function() {

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


  this.route('image', function(){
    this.route('view', { path: '/view/:image_id' });
  });

  this.route('folder', function(){
    this.route('view', { path: '/view/:folder_id' });
  });

  this.route('tale', function(){
    this.route('view', { path: '/view/:tale_id' });
  });

  this.route('register-dataone', function() {
    this.route('', { path: '/:doi' });
  });
  
});

export default Router;
