import Controller from '@ember/controller';
import config from 'wholetale/config/environment';
import EventStream from 'npm:sse.js';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import $ from 'jquery';
import { getOwner } from '@ember/application';

export default Controller.extend({
  // requires the sessions controller
  session: service(),
  userAuth: service('user-auth'),
  internalState: service('internal-state'),
  notificationHandler: service('notification-handler'),
  tokenHandler: service(),

  user: computed(function() {
    return {
      fullName: "John Winter"
    }
  }),
  gravatarUrl: "/images/avatar.png",
  currentPage: "Dashboard",
  currentIcon: "browser",
  routing: service('-routing'),
  loggedIn: false,
  staticMenu: true,
  isLoadingJobs: true,
  mobileMenuDisplay: false,

  init() {
    this._super();
    // this.set('staticMenu', this.get('internalState').getIsStaticMenu());
    this.set('staticMenu', true);
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

  checkMyRouteName: computed(function () {
    return this.get('routing.currentRouteName');
  }),
  currentUserName: 'Hallo!',
  actions: {
    toggle: function (subSidebarName) {
      $('#' + subSidebarName)
        .sidebar('setting', 'transition', 'push')
        .sidebar('toggle');
    },
    logout: function () {

      this.get('userAuth').logoutCurrentUser();
      this.set('loggedIn', false);
      // let location = this.get('router.url');
      // window.location.href = location.split('?')[0];
      this.transitionToRoute('login');
    },
    refreshJobs: function () {
      const controller = this;
      controller.set('isLoadingJobs', true);
      this.store.findAll('job', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }).then(jobs => {
        controller.set('jobs', jobs);
        window.setTimeout(controller.set.bind(controller, 'isLoadingJobs', false), 2000);
      });
    },
    staticMenu: function () {
      this.set('staticMenu', true);
      this.get('internalState').setStaticMenu(true);
    },
    dynamicMenu: function () {
      this.set('staticMenu', false);
      this.get('internalState').setStaticMenu(false);
    },
    closeMenu: function (pageTitle, icon) {
      this.set('currentPage', pageTitle);
      this.set('currentIcon', icon);
      // $('.sidebar').sidebar("toggle");
      if ($('.ember-burger-menu')) {
        this.actions.toggleMobileMenu.call(this);
      }

      if (pageTitle === "logout") {
        this.send("logout"); // call logout above.
      }
    },
    openJobWatcher() {
      $('.message.job-watcher').removeClass('hidden');
    },
    toggleMobileMenu() {
      let displayMobileMenu = !this.get('mobileMenuDisplay');
      this.set('mobileMenuDisplay', displayMobileMenu);
    }
  }

});
