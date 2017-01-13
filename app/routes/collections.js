import Ember from 'ember';


import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
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

