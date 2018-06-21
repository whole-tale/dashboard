import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model (params) {
    this._super();

    return this.get('store').findAll('instance', {
      reload: true
    });
  },

  setupController (controller, model) {
    this._super(controller, model);

    controller.set('model', model);

  },
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
