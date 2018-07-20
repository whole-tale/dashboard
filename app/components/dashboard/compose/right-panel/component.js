import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['showUpperPanel', 'showLowerPanel'],
  showUpperPanel: true,
  showLowerPanel: true,

  actions: {
    dummy: function() {
      //this.sendAction('action');
    },
    onLeftModelChange : function (model) {
      this.sendAction('onLeftModelChange', model); // sends to parent component
    }
  }

});
