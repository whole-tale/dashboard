import Ember from 'ember';
import config from 'wholetale/config/environment';
import EventStream from 'npm:sse.js';

var inject = Ember.inject;

const {
  getOwner
} = Ember;

export default Ember.Controller.extend({
  // requires the sessions controller
  userAuth: Ember.inject.service('user-auth'),
  internalState: Ember.inject.service('internal-state'),
  notificationHandler: Ember.inject.service('notification-handler'),
  tokenHandler: Ember.inject.service(),

  user : {fullName :"John Winter"},
  gravatarUrl : "/images/avatar.png",
  currentPage : "Dashboard",
  currentIcon : "browser",
  routing: Ember.inject.service('-routing'),
  loggedIn : false,
  staticMenu : true,
  isLoadingJobs: true,
  newUIMode : true,

  init() {
    this._super();
    // this.set('staticMenu', this.get('internalState').getIsStaticMenu());
    this.set('staticMenu', true);
    this.get('internalState').setNewUIMode(true);
    this.get('userAuth').getCurrentUserFromServer().then(
      (user) => {
        this.set('user', user);
      },
      (error) => {
        console.log(`There was an error loading the logged user: ${error}`);
      }
    );
    
    // this.set('eventStream', this.getEventStream.call(this));
  },

  // getEventStream() {
  //   let token = this.get('tokenHandler').getWholeTaleAuthToken();
  //   let source = new EventStream.SSE(config.apiUrl+"/notification/stream?timeout=15000", {headers: {'Girder-Token': token}});

  //   let self = this;
  //   source.addEventListener('message', function(evt) {
  //     let payload = JSON.parse(evt.data);
  //   });

  //   source.stream();

  //   return source;
  // },

  checkMyRouteName: Ember.computed(function() {
    return this.get('routing.currentRouteName');
  }),
  currentUserName: 'Hallo, Damian',
  actions: {
    toggle: function(subSidebarName) {
      console.log(subSidebarName);
      $('#'+subSidebarName)
        .sidebar('setting', 'transition', 'push')
        .sidebar('toggle')
      ;
    },
    logout : function() {

        this.get('userAuth').logoutCurrentUser();
        this.set('loggedIn', false);
//      var location = this.get('router.url');
  //    window.location.href = location.split('?')[0];

        this.transitionToRoute('login');
    },
    refreshJobs: function() {
      const controller = this;
      controller.set('isLoadingJobs', true);
      this.store.findAll('job')
        .then(jobs => {
          controller.set('jobs', jobs);
          window.setTimeout(controller.set.bind(controller, 'isLoadingJobs', false), 2000);
        })
      ;
    },
    staticMenu: function() {
      this.set('staticMenu', true);
      this.get('internalState').setStaticMenu(true);
    },
    dynamicMenu: function() {
      this.set('staticMenu', false);
      this.get('internalState').setStaticMenu(false);
    },
    coolUI: function() {
      this.set('newUIMode', true);
      this.get('internalState').setNewUIMode(true);
      this.transitionToRoute("browse");
    },
    boringUI: function() {
      this.set('newUIMode', false);
      this.get('internalState').setNewUIMode(false);
      this.transitionToRoute("index");
    },


    closeMenu : function(pageTitle, icon) {
      this.set('currentPage', pageTitle);
      this.set('currentIcon', icon);
      $('.sidebar').sidebar("toggle");

      if (pageTitle === "logout") {
        this.send("logout"); // call logout above.
      }
    },
    openJobWatcher() {
      $('.message.job-watcher').removeClass('hidden');
    }
  }

});
