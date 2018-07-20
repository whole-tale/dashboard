import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    dummy: function() {
      //this.sendAction('action');
    },
    onLeftModelChange : function (model) {
      this.sendAction('onLeftModelChange', model); // sends to parent component
    }
  }

});
