import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('contact');
  this.route('about');

  // Menu Routes

  this.route('explore');
  this.route('search');
  this.route('recipe-image');
  this.route('status');
  this.route('login');

  this.route('upload', function () {
    this.route('view', {
      path: '/view/:file_id'
    });
    this.route('edit', {
      path: '/edit/:file_id'
    });
    this.route('preview', {
      path: '/preview/:file_id'
    });
  });

  this.route('catalog', function () {

  });

  this.route('collaborators', function () {
    this.route('list', {
      path: '/'
    });
    this.route('view', {
      path: '/view/:user_id'
    });
  });

  // Data Routes

  this.route('nextcloud');

  this.route('collections', function () {
    this.route('list', {
      path: '/'
    });
    this.route('view', {
      path: '/view/:collection_id'
    });
    this.route('edit', {
      path: '/edit/:collection_id'
    });
    this.route('new');
  });


  this.route('image', function () {
    this.route('view', {
      path: '/view/:image_id'
    });
  });

  this.route('folder', function () {
    this.route('view', {
      path: '/view/:folder_id'
    });
  });

  this.route('tale', function () {
    this.route('view', {
      path: '/view/:tale_id'
    });
  });

  this.route('browse');
  // old compose UI route.
  this.route('pcompose');

  // new UI routes

  this.route('browse');
  this.route('run', function() {
    this.route('index', { path: '/' });
    this.route('view', { path: '/:instance_id'});
  });
  this.route('manage', function () {
    this.route('index', { path: '/'});
    this.route('view', { path: '/:image_id'});
  });
  this.route('compose', function() {
    this.route('index', { path: '/' });
    this.route('new', { path: '/new'});
  });

  // found this typical error:
  // this.route("search", { path: "/search" });
  // this.route("search", { path: "/search/:query" });
  // MUST be changed into:
  // this.resource("search", { path: "/search" }, function() {
  //   this.route(':query');
  // });
  this.route('login-success');
});

export default Router;
