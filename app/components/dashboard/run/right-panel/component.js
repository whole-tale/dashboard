import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['showInstances', 'showMiniBrowser'],
  showInstances: true,
  showMiniBrowser: true,

  actions: {
    onLeftModelChange : function (model) {
      this.sendAction('onLeftModelChange', model); // sends to parent component
    }
  }

});
