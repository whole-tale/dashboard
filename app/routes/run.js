import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({

  model: function (params) {
    this._super();

    return this.get('store').findAll('instance', {
      reload: true
    });
  },

  setupController: function (controller, model) {
    this._super(controller, model);

    controller.set('model', model);

  },
  actions: {

    onShowInstance: function (model) {
      // alert("In Run Route !!");
      //this.sendAction('onShowInstance', model); // sends to parent component
    },

    refreshCurrentRoute: function () {
      console.log("Refreshing Data");
      this.refresh();
    }

  }

});
