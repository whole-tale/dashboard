import Ember from 'ember';
var inject = Ember.inject;

// for dev:


import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  internalState: inject.service(),
  userAuth: inject.service(),
  model: function() {
    this._super();
    var state = this.get('internalState');

    var thisUserID = this.get('userAuth').getCurrentUserID();

    console.log("The user id is = " + thisUserID);
    console.log(thisUserID);

    var folderID = state.getCurrentFolderID();

    console.log("loading the route for the index again");
    console.log("Folder ID: " + folderID);

    var folderContents = null;
    var itemContents = null;

    if (folderID === null || folderID === "null" ) {
      folderContents = this.get('store').query('folder', {parentId: thisUserID, parentType : "user" });
      state.setCurrentParentId(thisUserID);
      state.setCurrentParentType("user");
    } else {
      console.log("Folder != null, so loading folder and items");
      folderContents = this.get('store').query('folder', {parentId: folderID, parentType: 'folder'}); 
      itemContents= this.get('store').query('item', {folderId: folderID});
      console.log("Folder != null, leaving");
    }

    return {'folderContents' : folderContents, 'itemContents' : itemContents};
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('fileData', model);
  }
});
