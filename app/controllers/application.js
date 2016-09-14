import Ember from 'ember';

export default Ember.Controller.extend({

  _loggedIn : false,
  loggedIn : function() {
    return this._loggedIn;
  },
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
    closeMenu : function() {
      $('.sidebar').sidebar("toggle");
    }
  }
});
