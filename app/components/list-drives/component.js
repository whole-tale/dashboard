/**
  @module wholetale
  @submodule list-drives
*/
import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    selectDrive : function(name) {
      this.sendAction('action', name);
    }
  }
});
