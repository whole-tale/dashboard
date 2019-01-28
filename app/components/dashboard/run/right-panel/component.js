import Ember from 'ember';

const service = Ember.inject.service.bind(Ember);

export default Ember.Component.extend({
  router: service(),

  classNameBindings: ['showUpperPanel', 'showLowerPanel'],
  showUpperPanel: true,
  showLowerPanel: false,

  actions: {
    onLeftModelChange : function (model) {
      // this.sendAction('onLeftModelChange', model); // sends to parent component
      this.get('router').transitionTo('run.view', model.get('id'));
    }
  }

});
