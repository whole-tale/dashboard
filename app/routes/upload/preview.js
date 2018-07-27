import Route from '@ember/routing/route';
import ResetScroll from 'wholetale/mixins/reset-scroll';

export default Route.extend(ResetScroll, {
  activate() {
    // this mixin moves the page up to the top - removes the current scroll
    this._super.apply(this, arguments);
  },

  afterModel(model) {
    // console.log("In the afterModel hook in route for the view in upload");
    // console.log(model);
    this.set('pass_model', model);
    // console.log(transition);
  },

  model(params, transition) {
    let fileId = (params.hasOwnProperty('file_id')) ? params.file_id : transition.params['data.list'].file_id;

    // console.log("In the file view routes and params is");
    // console.log(params);
    // console.log(transition.params);
    // console.log("The fieldID " + fileId);

    return this.store.get('item', fileId);
  },

  setupController(controller) {
    // console.log("Setup Controller in the route for view");

    let model = this.get('pass_model');
    this.set('model', model);
    this._super(controller, model);
    controller.set('model', model);
  }

});
