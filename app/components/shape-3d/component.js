/**
  @module wholetale
  @submodule components/shape-3d
*/
import Ember from 'ember';

export default Ember.Component.extend({

  store: Ember.inject.service(),

  actions: {
      selectCard : function(name) {
        this.sendAction('action', name);
      }
    }


});
