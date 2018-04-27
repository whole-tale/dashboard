import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model: function(params) {
    this._super();

    return this.get('store').findAll('instance');
  },

  setupController: function(controller, model) {
    this._super(controller, model);

    controller.set('model', model);

  }


});
