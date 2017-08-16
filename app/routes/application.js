import Ember from 'ember';
import config from '../config/environment';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model: function(params) {
    // console.log("Called Authenticate, proceeding in Application");
    let router = this;
    return router._super(...arguments)
        .then(_ => {
            let user = router.get('userAuth').getCurrentUser();
            return user;
        });
  },
  setupController: function(controller, model) {
    this._super(controller, model);

    if (model) {
      controller.set('loggedIn', true);
      controller.set('user', model);
      controller.set('gravatarUrl', config.apiUrl + "/user/" + model.get('_id') + "/gravatar?size=64")
    }
  },
  actions: {
    toRoute() {
      this.transitionTo.call(this, ...arguments);
      return true;
    }
  }
});
