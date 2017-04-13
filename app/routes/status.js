import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model: function(params) {
    this._super();
    console.log("The parameters are ");
    console.log(params);
    return this.get('store').findAll('instance');
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    console.log("In status router set controller method");

    controller.set('model', model);
    controller.grabData(model);
  }


});
