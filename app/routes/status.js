import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model: function(params) {
    this._super();
    console.log("The parameters are ");
    console.log(params);
    return this.get('store').findAll('instance');
  }

});
