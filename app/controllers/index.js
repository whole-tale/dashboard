import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    gotoDataset : function(name) {
      if (name === "Browser Upload")
        this.transitionToRoute("data-upload");
      else
        this.transitionToRoute(name.toLowerCase());
    },
    gotoNextcloud: function(name) {
        this.transitionToRoute("nextcloud");
    },
    gotoSearch : function(name) {
      this.transitionToRoute("search");
    },
    gotoDrives : function(name) {
      this.transitionToRoute("drives");
    },
    gotoPublish : function(name) {
        this.transitionToRoute("research");
    }
  },
});

