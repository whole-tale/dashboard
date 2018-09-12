import ResetScroll from 'wholetale/mixins/reset-scroll';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend(ResetScroll, {
  internalState: service(),
  activate: function () {
    // this ResetScroll mixin moves the page up to the top - removes the current scroll
    // but doesn't work sometimes ... argh ...
    this._super.apply(this, arguments);
  },
  init() {
    this._super(...arguments);
  },

  model(params, transition) {
    let taleId;
    if (params.hasOwnProperty("tale_id")) {
      taleId = params.tale_id;
    } else {
      taleId = transition.params['tale.view'].tale_id;
    }
    let taleObj = this.store.findRecord('tale', taleId);
    return taleObj;
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.get('internalState').addRecentTale(model.get('id'));
    let imageId = model.get('imageId');

    let folderId = model.get('folderId');

    this.get('store').find('folder', folderId).then(folder => {
      controller.set('folder', folder);
    });

    this.get('store').find('image', imageId).then(image => {
      controller.set('image', image);
    });
  }

});
