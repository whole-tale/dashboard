import Ember from 'ember';

export default Ember.Route.extend({
    model(params, transition) {
      var fileId;

      console.log("In the file view routes and params is" );
      console.log(params);
      console.log(transition.params);

      if (params.hasOwnProperty("file_id"))
        fileId = params.file_id;
      else
        fileId = transition.params['data.list'].file_id;

      console.log("The fieldID " + fileId);

      return this.store.get('item', fileId);
    },
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('model', model);
  }

});
