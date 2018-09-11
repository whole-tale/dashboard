import Route from '@ember/routing/route';
import ResetScroll from 'wholetale/mixins/reset-scroll';

export default Route.extend(ResetScroll, {
  activate() {
    // this mixin moves the page up to the top - removes the current scroll
    this._super.apply(this, arguments);
  },
  init() {
    this._super(...arguments);
  },

  afterModel(model, transition) {
    this.set('pass_model', model);
    // let me = this; // this is never used
  },

  model(params, transition) {
    let fileId = (params.hasOwnProperty("file_id")) ? params.file_id : transition.params['upload.edit'].file_id;
    let fileObj = this.store.findRecord('item', fileId);
    return fileObj;
  },
  setupController(controller) {
    let model = this.get('pass_model');
    this.set('model', model);
    this._super(controller, model);
    controller.set('model', model);
  }

});
