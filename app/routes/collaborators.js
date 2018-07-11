import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model: function (params) {
    this._super();
    console.log("The parameters are ");
    console.log(params);
    return this.get('store').findAll('user', {
      reload: true,
      adapterOptions: {
        queryParams: {
          sort: "created",
          sortdir: "1",
          limit: "0"
        }
      }
    });
  }
});
