import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    gotoPublish : function(name) {
      scroll(0,0);
      this.transitionToRoute("compose");
    },
  },
});
