import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  collections: Ember.computed.alias('content'),
  isSelected : null,
  init() {

    var isSel= {};
    var models = this.collections;
    console.log(models);
    for (var m in models) {
      console.log("ID is " + m._id);
      isSel[m._id] = true;
    }
    console.log("isSelected:");

    console.log(isSel);
    this.set("isSelected", isSel);
  },
  actions: {
    test: function() {
    },
    pre_checked : function (collection_id) {
      alert(collection_id);
//        if (collection_id = "") {}
    }
  }
});
