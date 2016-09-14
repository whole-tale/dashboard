/**
  @module wholetale
  @submodule big-button
*/
import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    gotoPage : function() {
      this.sendAction('action');
    }
  }

});
