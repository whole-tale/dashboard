import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model(params, transition) {

    return {
        
        // Set the doi from the url parameter. This will eventually get passed to 
        // and used in the data copy process
      doi: transition.params['register-dataone.'],
    };
  },

  // Because the controller handles registration, we'll pass the doi
  // down and start the data copying process. Once started, the route is 
  // changed to allow the user to start creating their tale.
  setupController: function(controller, model) {

    // this only gets called on initial load and *not* on refresh
    this._super(controller, model);

    // Pass the doi down to the controller
    controller.set('doi', model.doi);

    // Search for and register the dataset
    controller.send('copyData');

    // Place the user at the beginning of the compose tale process
    this.transitionTo('compose');
  },
});
