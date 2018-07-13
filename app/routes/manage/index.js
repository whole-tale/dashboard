import Ember from 'ember';
var inject = Ember.inject;

import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  internalState: inject.service(),
  userAuth: inject.service(),
  model: function () {
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

    if (!folderID || folderID === "null") {
      folderContents = this.get('store').query('folder', {
        parentId: thisUserID,
        parentType: "user",
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });
      state.setCurrentParentId(thisUserID);
      state.setCurrentParentType("user");
    } else {
      console.log("Folder != null, so loading folder and items");
      folderContents = this.get('store').query('folder', {
        parentId: folderID,
        parentType: 'folder',
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });
      itemContents = this.get('store').query('item', {
        folderId: folderID,
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });
      console.log("Folder != null, leaving");
    }

    return RSVP.hash({
      folderContents: folderContents,
      itemContents: itemContents,
      images: this.get('store').findAll('image', {
        reload: true,
        adapterOptions: {
          queryParams: {
            sort: "lowerName",
            sortdir: "1",
            limit: "50"
          }
        }
      })
    });
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    controller.set('fileData', { folderContents: model.folderContents, itemContents: model.itemContents});
  }
});
