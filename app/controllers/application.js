import Ember from 'ember';
var inject = Ember.inject;

const {
  getOwner
} = Ember;

export default Ember.Controller.extend({
  // requires the sessions controller
  userAuth: Ember.inject.service('user-auth'),
  internalState: Ember.inject.service('internal-state'),

  user : {fullName :"John Winter"},
  gravatarUrl : "/images/avatar.png",
  currentPage : "Dashboard",
  currentIcon : "browser",
  routing: Ember.inject.service('-routing'),
  loggedIn : false,
  staticMenu : true,
  init() {
    this._super();
    this.set('staticMenu', this.get('internalState').getIsStaticMenu());
  },
  checkMyRouteName: Ember.computed(function() {
    return this.get('routing.currentRouteName');
  }),
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
    staticMenu: function() {
      this.set('staticMenu', true);
      this.get('internalState').setStaticMenu(true);
    },
    dynamicMenu: function() {
      this.set('staticMenu', false);
      this.get('internalState').setStaticMenu(false);
    },
    closeMenu : function(pageTitle, icon) {
      this.set('currentPage', pageTitle);
      this.set('currentIcon', icon);
      $('.sidebar').sidebar("toggle");

      if (pageTitle === "logout") {
        this.send("logout"); // call logout above.
      }
    }
  }

});
