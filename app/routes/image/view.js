import Ember from 'ember';
import ResetScroll from 'wholetale/mixins/reset-scroll';

export default Ember.Route.extend(ResetScroll, {
  activate: function() {
    // this mixin moves the page up to the top - removes the current scroll
    this._super.apply(this, arguments); // Call super at the beginning
  },
  init() {
    console.log("In the route for the view in image");
  },

  model(params, transition) {
    var imageId;

    console.log("In the image view routes and params is" );
    console.log(params);
    console.log(transition.params);

    if (params.hasOwnProperty("image_id"))
      imageId = params.image_id;
    else
      imageId = transition.params['image.view'].image_id;

    console.log("The image ID " + imageId);

    var imageObj = this.store.findRecord('image', imageId);

    console.log(imageObj);
    return imageObj;
  }
});
