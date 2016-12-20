import Ember from 'ember';

export default Ember.Route.extend({
    init() {
      console.log("In the route for the view in upload");
    },

    afterModel : function(model, transition) {
      console.log("In the afterModel hook in route for the view in upload");
      console.log(model);
      this.set('pass_model', model);

      console.log(transition);
      var me=this;

    },

    model(params, transition) {
      var fileId;

      console.log("In the file view routes and params is" );
      console.log(params);
    //  console.log(transition.params);

      if (params.hasOwnProperty("file_id"))
        fileId = params.file_id;
      else
        fileId = transition.params['data.list'].file_id;

      console.log("The fieldID " + fileId);

      return this.store.get('item', fileId);
    },
  setupController: function(controller) {
    console.log("Setup Controller in the route for view" );

    var model = this.get('pass_model');
    this.set('model', model);
    this._super(controller, model);
    controller.set('model', model);
  }

});
