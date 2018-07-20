import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    onLeftModelChange : function (model) {
      // Needs fixing

      this.sendAction('onLeftModelChange', model); // sends to parent component
    },
  }

});
