import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['showUpperPanel', 'showLowerPanel'],
  showUpperPanel: true,
  showLowerPanel: true,

  actions: {
    onLeftModelChange : function (model) {
      this.sendAction('onLeftModelChange', model); // sends to parent component
    }
  }

});
