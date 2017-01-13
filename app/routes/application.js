import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model: function(params) {
    console.log("Calling appl router");
    this._super();

    // console.log("Called Authenticate, proceeding in Application");

    return this.get('userAuth').getCurrentUser();
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    if (model) {
      controller.set('loggedIn', true);
      controller.set('user', model);
    }
  }
  });
