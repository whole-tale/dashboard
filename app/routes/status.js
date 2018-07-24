import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model(params) {
    this._super();
    console.log("The parameters are ");
    console.log(params);
    return this.get('store').findAll('instance', {
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    console.log("In status router set controller method");
    controller.set('model', model);

    // this is called from the controller anyway - removing it I.T.
    // controller.grabData(model);
  }
});
