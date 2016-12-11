import Ember from 'ember';


export default Ember.Route.extend({
 model: function(params) {
   console.log("The parameters are ");
   console.log(params);
   return this.get('store').findAll('collection');
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('model', model);
  }
});

