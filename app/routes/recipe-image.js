import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  internalState: Ember.inject.service(),

  model() {
    var state = this.get('internalState');
    var thisUserID = this.get('userAuth').getCurrentUserID();
    var allData = [];

    return {
      recipes: this.get('store').findAll('recipe'),
    };
  }

});
