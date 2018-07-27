import TextField from '@ember/component/text-field';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer, computed } from '@ember/object';
import Object from '@ember/object';
import $ from 'jquery';

function wrapFolder(folderID, folderName) {
  return {
    "name": folderName,
    "id": folderID,
    "isFolder": true,

    get: function (name) {
      if (name === "name") return folderName;
      else if (name === "id") return folderID;
      else return null;
    }
  };
}

TextField.reopen({
  attributeBindings: ['multiple']
});

export default Component.extend({
  internalState: service(),
  store: service(),
  folderNavs: service(),
  router: service(),
  
  fileBreadCrumbs: computed(function() {
    return {};
  }),
  currentBreadCrumb: computed(function() {
    return [];
  }),
  currentNav: computed(function() {
    return {};
  }),
  currentNavCommand: "home",
  currentNavTitle: "Home",
  parentId: null,
  file: "",

  fileChosen: observer('file', function () {
    if (this.get('file') === "") return;
    let uploader = $('.nice.upload.hidden');
    let files = uploader[0].files;
    let dz = window.Dropzone.forElement(".dropzone");
    for (let i = 0; i < files.length; i++) {
      dz.addFile(files[i]);
    }
    this.set('file', '');
  }),

  init() {
    this._super(...arguments);
    let state = this.get('internalState');
    
    state.setCurrentBreadCrumb(null);
    state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
    state.setCurrentFolderName("");
    
    this.set("currentBreadCrumb", null);
    this.set("fileBreadCrumbs", []);

    this.set('fileData', this.model);
    this.set("currentFolderId", state.getCurrentFolderID());
    // console.log("Heading into browse upload controller" );

    this.get("folderNavs").getCurrentFolderNavAndSetOn(this);

    let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();
    if (!fileBreadCrumbs) {
      fileBreadCrumbs = [];
      state.setCurrentFileBreadcrumbs(fileBreadCrumbs); // new collection, reset crumbs
    }

    if (state.getCurrentParentType() !== 'user') {
      let bc = wrapFolder(state.getCurrentFolderID(), state.getCurrentFolderName());
      this.set("currentBreadCrumb", bc);
      state.setCurrentBreadCrumb(bc);
    }

    this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs()); // new collection, reset crumbs
  },

  actions: {
    //----------------------------------------------------------------------------
    refresh() {
      // console.log("refreshed");
      let state = this.get('internalState');
      let myController = this;
      let itemID = state.getCurrentFolderID();

      let folderContents = myController.store.query('folder', {
        parentId: itemID,
        parentType: "folder",
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });

      let itemContents = myController.store.query('item', {
        folderId: itemID,
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });

      let newModel = {
        'folderContents': folderContents,
        'itemContents': itemContents
      };

      // alert("Folder clicked and delving into " + itemName);

      // console.log(newModel);
      // console.log(state.toString());

      myController.set("fileData", newModel);
    },

    //----------------------------------------------------------------------------
    navClicked: function (nav) {
      // console.log("Folder Nav clicked " + nav.command);
      let controller = this;
      let state = this.get('internalState');

      let folderContents = null;
      let itemContents = null;

      state.setCurrentNavCommand(nav.command);
      this.set('currentNav', nav);
      this.set("currentNavCommand", nav.command);
      this.set("currentNavTitle", nav.name);

      if (nav.command === "home" || nav.command === "user_data" || nav.command === "workspace") {
        // console.log(nav);
        folderContents = controller.get('store').query('folder', {
            parentId: nav.parentId,
            parentType: nav.parentType,
            name: nav.name,
            reload: true,
            adapterOptions: {
              queryParams: {
                limit: "0"
              }
            }
          }).then(folders => {
            if (folders.length) {
              let folder_id = folders.content[0].id;

              state.setCurrentFolderID(folder_id);
              state.setCurrentParentId(nav.parentId);
              state.setCurrentParentType(nav.parentType);
              state.setCurrentFolderName(nav.name);
              controller.set("currentFolderId", folder_id);

              itemContents = controller.store.query('item', {
                folderId: folder_id,
                reload: true,
                adapterOptions: {
                  queryParams: {
                    limit: "0"
                  }
                }
              });
              return controller.store.query('folder', {
                "parentId": folder_id,
                "parentType": "folder"
              });
            }
            throw new Error(nav.name + " folder not found.");
          })
          .catch(() => {
            // console.log(["Failed to fetch contents of folder", e]);
          });
      } else if (nav.command === "recent") {
        let uniqueSetOfRecentFolders = [];
        let recentFolders = state.getRecentFolders().filter(folder => {
          let index = uniqueSetOfRecentFolders.findIndex(added => {
            return added === folder;
          });
          let isAdded = index < 0 ? false : true;
          if (!isAdded) {
            uniqueSetOfRecentFolders.push(folder);
            return true;
          }
          return false;
        });
        let payload = JSON.stringify({
          "folder": recentFolders
        });
        // console.log(payload);
        folderContents = controller.get('store').query('resource', {
          "resources": payload
        });
        // console.log(folderContents);
        // alert("Not implemented yet ...");
      }

      let newModel = {};
      folderContents
        .then(_folderContents => {
          newModel.folderContents = _folderContents;
          return itemContents;
        })
        .then(_itemContents => {
          newModel.itemContents = _itemContents;
        })
        .finally(() => {
          controller.set("fileData", newModel);
        });

      state.setCurrentBreadCrumb(null);
      state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
      state.setCurrentFolderName("");
      this.set("currentBreadCrumb", null);
      this.set("fileBreadCrumbs", []);

    },

    //----------------------------------------------------------------------------
    itemClicked: function (item, isFolder) {
      let state = this.get('internalState');
      let myController = this;

      let itemID = item.get('_id');
      let itemName = item.get('name');

      if (isFolder === "true") {
        // console.log("Item ID is " + itemID);

        this.store.find('folder', itemID).then(function (folder) {
          // console.log(JSON.stringify(folder));
          // console.log(folder.get('parentId').toString());

          myController.set("parentId", folder.get('parentId'));

          state.setCurrentParentId(folder.get('parentId'));
          state.setCurrentParentType(folder.get('parentCollection'));

          let folderContents, itemContents;
          try {
            folderContents = myController.store.query('folder', {
              parentId: itemID,
              parentType: "folder"
            });
            itemContents = myController.store.query('item', {
              folderId: itemID
            });

            let newModel = {
              'folderContents': folderContents,
              'itemContents': itemContents
            };
            myController.set("fileData", newModel);
          } catch (e) {
            // TODO(Adam): better handle this somehow. for now I just log a message
            // console.log("could not load the folder's contents... " + e.message);
          }

          // console.log("State toString " + state.toString());
          // add to history (recent folders visited)

          // NOTE(Adam): The following code was moved into the "find folder .then" clause. We need this here
          //             to make sure we only update breadcrumbs after successfully navigating into the folder.
          state.addFolderToRecentFolders(itemID);

          state.setCurrentFolderID(itemID);
          state.setCurrentFolderName(itemName);

          myController.set("currentFolderId", itemID);

          let previousBreadCrumb = state.getCurrentBreadCrumb();

          state.setCurrentBreadCrumb(item);

          let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();

          if (previousBreadCrumb) { // NOTE(Adam): prevent from pushing a null value into the array
            fileBreadCrumbs.push(previousBreadCrumb);
          }

          state.setCurrentFileBreadcrumbs(fileBreadCrumbs);

          myController.set("currentBreadCrumb", state.getCurrentBreadCrumb());
          myController.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs());
        });

      } else {
        // myController.get('router').transitionTo('upload.view', item.get('id'));
      }
    },

    //----------------------------------------------------------------------------
    breadcrumbClicked: function (item) {
      let state = this.get('internalState');
      let crumbs = state.getCurrentFileBreadcrumbs();

      //    console.log("Breadcrumb clicked on item ");
      //    console.log(item);

      let previousItem = null;
      let newCrumbs = [];
      for (let i; i < crumbs.length; ++i) {
        if (crumbs[i].name === item.get('name'))
          break;
        else {
          newCrumbs.append(crumbs[i]);
          previousItem = crumbs[i];
        }
      }

      // console.log(newCrumbs);

      state.setCurrentFileBreadcrumbs(newCrumbs);
      state.setCurrentFolderID(item._id);
      state.setCurrentFolderName(item.name);
      state.setCurrentBreadCrumb(previousItem); // need to set this because itemClicked is expecting the previous breadcrumb.

      this.set('currentFolderId', item._id);

      this.send('itemClicked', Object.create(item), "true");
    },

    //----------------------------------------------------------------------------
    openUploadDialog() {
      $('.nice.upload.hidden').click();
    },

    //----------------------------------------------------------------------------
    openModal(modalName) {
      let modal = $('.ui.' + modalName + '.modal');
      modal.parent().prependTo($(document.body));
      modal.modal('show');
    },

    //----------------------------------------------------------------------------
    insertNewFolder(folder) {
      let parentId = folder.get('parentId');
      let parentType = folder.get('parentCollection');

      let folderContents = this.store.query('folder', {
        parentId: parentId,
        parentType: parentType
      });
      let itemContents = this.fileData.itemContents;
      let collections = this.fileData.collections;
      let newModel = {
        'folderContents': folderContents,
        'itemContents': itemContents,
        'collections': collections
      };
      this.set('fileData', newModel);
    },

    //-----------------------------------------------------------------------------
    openCreateFolderModal() {
      // NOTE(Adam): Certain Semantic UI components depends heavily on jquery to work properly. The Modal component is one such component
      //             , and although its bad practice to include jquery, it is needed here until we can
      //             replace Semantic UI Modals with something else.
      // (see: https://semantic-org.github.io/Semantic-UI-Ember/#/modules/modal)

      $('.ui.modal.newfolder').modal('show');
    },

    //-----------------------------------------------------------------------------
    openRegisterModal() {
      $('.ui.modal.harvester').modal('show');
    }

  }

});
