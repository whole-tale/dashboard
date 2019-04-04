import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model (params) {
    this._super();

    return this.get('store').findAll('instance', {
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0",
        }
      }
    });
  },

  /*afterModel(model, transition) {
    let queryParams = transition['queryParams'];
    if (queryParams['auth']) {
        model.set('auth', queryParams['auth'])
    }
  },*/

  actions: {
    onShowInstance (model) {
      // alert("In Run Route !!");
      //this.sendAction('onShowInstance', model); // sends to parent component
    },
    refreshCurrentRoute () {
      console.log("Refreshing Data");
      this.refresh();
    }
  }

});
