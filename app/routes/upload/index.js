import { inject as service } from '@ember/service';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  internalState: service(),
  userAuth: service(),

  model() {
    this._super();
    let state = this.get('internalState');

    let  thisUserID = this.get('userAuth').getCurrentUserID();

    // console.log("The user id is = " + thisUserID);

    // console.log(thisUserID);

    let  folderID = state.getCurrentFolderID();

    // console.log("loading the route for the index again");
    // console.log("Folder ID: " + folderID);

    let  folderContents = null;
    let  itemContents = null;

    if (folderID === null || folderID === "null") {
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
      // console.log("Folder != null, so loading folder and items");
      folderContents = this.get('store').query('folder', {
        parentId: folderID,
        parentType: "folder",
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
      // console.log("Folder != null, leaving");
    }

    return {
      'folderContents': folderContents,
      'itemContents': itemContents
    };
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    controller.set('fileData', model);
  }
});
