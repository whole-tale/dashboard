import Ember from 'ember';
import ResetScroll from 'wholetale/mixins/reset-scroll';

export default Ember.Route.extend({
  internalState: Ember.inject.service(),
  activate: function () {
    // this mixin moves the page up to the top - removes the current scroll
    // but doesn't work sometimes ... argh ...
    this._super.apply(this, arguments);
  },
  init() {
    console.log("In the route for the view in tale");
  },

  model(params, transition) {
    var taleId;

    console.log("In the tale view routes and params is");
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
    this.get('internalState').addRecentTale(model.get('id'));
    let imageId = model.get('imageId');

    let involatileData = model.get('involatileData');
    if(involatileData) {
      let promises = [];
      involatileData.forEach(x => {
        if(x.type === 'file') {
          promises.push(this.get('store').find('file', x.id));
        } else {
          promises.push(this.get('store').find('folder', x.id));
        }
      });

      Promise.all(promises).then((values) => {
        console.log(values);
        controller.set('items', values);
      });
    } else {
      controller.set('items', Ember.A());
    }

    this.get('store').find('image', imageId)
      .then(image => {
        controller.set('image', image);
      });
  }

});
