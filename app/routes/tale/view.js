import Ember from 'ember';

export default Ember.Route.extend({
    init() {
      console.log("In the route for the view in tale");
    },

    model(params, transition) {
      var taleId;

      console.log("In the tale view routes and params is" );
      console.log(params);
      console.log(transition.params);

      if (params.hasOwnProperty("tale_id"))
        taleId = params.tale_id;
      else
        taleId = transition.params['tale.view'].tale_id;

      console.log("The tale ID " + taleId);

      var taleObj = this.store.findRecord('tale', taleId);

      console.log(taleObj);
      return taleObj;
    }

});
