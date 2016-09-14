import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    gotoDataset : function(name) {
      if (name === "Browser Upload")
        this.transitionToRoute("data-upload");
      else
        this.transitionToRoute(name.toLowerCase());
    },
    gotoSearch : function(name) {
      this.transitionToRoute("search");
    },
    gotoPublish : function(name) {
        this.transitionToRoute("research");
    }
  },
});

