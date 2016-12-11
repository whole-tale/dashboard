import Ember from 'ember';

// for dev:

var collectionName = "Ians Test Collection";
var  collectionID = "5811990986ed1d00011ad6d7";

export default Ember.Route.extend({
  model: function(params) {
    console.log("The parameters are ");
    console.log(params);

    var folderContents = this.store.query('folder', { parentId: collectionID, parentType: "collection"});
    var collections = this.get('store').findAll('collection');

    return { 'folderContents' : folderContents, 'collections' : collections, 'itemContents' : null};
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('fileData', model);
  }

});
