import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    selectEnvironment: function (model) {
      console.log('selecting environment ' + model.name);
    },
    cancel: function () {

    }
  }
});