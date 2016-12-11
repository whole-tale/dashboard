import Ember from 'ember';

const {
  getOwner
} = Ember;

export default Ember.Controller.extend({

  user : {fullName :"John Winter"},
  gravatarUrl : "/images/avatar.png",
  currentPage : "Dashboard",
  routing: Ember.inject.service('-routing'),

  checkMyRouteName: Ember.computed(function() {
    return this.get('routing.currentRouteName');
  }),

  loggedIn : false,

  actions: {
    toggle: function(subSidebarName) {
      console.log(subSidebarName);
      $('#'+subSidebarName)
        .sidebar('setting', 'transition', 'push')
        .sidebar('toggle')
      ;
    },
    logout : function() {
      alert("Do logout stuff!");
    },
    closeMenu : function(pageTitle) {
      this.set('currentPage', pageTitle);
      $('.sidebar').sidebar("toggle");
    },

  }
});
