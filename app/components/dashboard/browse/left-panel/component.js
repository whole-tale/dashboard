import Ember from 'ember';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';

export default Ember.Component.extend(FullScreenMixin, {

  actions: {
    gotoPublish : function(name) {
      scroll(0,0);
      this.sendAction("gotoPublish", name);
    },
  }

});
