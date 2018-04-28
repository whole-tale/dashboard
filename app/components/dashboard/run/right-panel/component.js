import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    onLeftModelChange : function (model) {
     // alert("2");

      this.sendAction('onLeftModelChange', model); // sends to parent component
    },
  }

});
