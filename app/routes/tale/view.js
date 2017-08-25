import Ember from 'ember';
import ResetScroll from 'wholetale/mixins/reset-scroll';

export default Ember.Route.extend({
  activate: function() {
    // this mixin moves the page up to the top - removes the current scroll
    // but doesn't work sometimes ... argh ...
    this._super.apply(this, arguments);
  },
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
    },

    setupController(controller, model) {
      this._super(...arguments);

      let imageId = model.get('imageId');
      let folderId = model.get('folderId');

      this.get('store').find('folder', folderId)
          .then(folder => {
              controller.set('folder', folder);
          });
          
      this.get('store').find('image', imageId)
          .then(image => {
              controller.set('image', image);
          });
    }

});
