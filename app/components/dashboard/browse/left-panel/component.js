import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    gotoPublish : function(name) {
      scroll(0,0);
      this.sendAction("gotoPublish", name);
    },
  },

});
