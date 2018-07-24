import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticateRoute from 'wholetale/routes/authenticate';
const inject = Ember.inject;

export default AuthenticateRoute.extend({
  internalState: inject.service(),
  userAuth: inject.service(),
  
  model(params) {
    this._super();
    let state = this.get('internalState');

    let thisUserID = this.get('userAuth').getCurrentUserID();
    let folderID = state.getCurrentFolderID();
    let folderContents = null;
    let itemContents = null;

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
    }
    return RSVP.hash({
      folderContents: folderContents,
      itemContents: itemContents,
      allImages: this.get('store').findAll('image', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }),
      selectedImage: this.get('store').findRecord('image', params.image_id, { reload: true })
    });
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    controller.set('fileData', { folderContents: model.folderContents, itemContents: model.itemContents});
  }
});
