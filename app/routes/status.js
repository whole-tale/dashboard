import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model() {
    this._super();
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
    controller.set('model', model);

    // this is called from the controller anyway - removing it I.T.
    // controller.grabData(model);
  }
});
