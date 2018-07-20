import Ember from 'ember';
let inject = Ember.inject;

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

Ember.TextField.reopen({
  attributeBindings: ['multiple']
});

export default Ember.Controller.extend({
  internalState: inject.service(),
  store: inject.service(),
  folderNavs: inject.service(),
  fileBreadCrumbs: {},
  currentBreadCrumb: [],
  currentNavCommand: "home",
  currentNavTitle: "Home",
  parentId: null,
  file: "",
  fileChosen: Ember.observer('file', function () {
    console.log(this.get('file'));
    if (this.get('file') === "") return;
    let uploader = Ember.$('.nice.upload.hidden');
    let files = uploader[0].files;
    let dz = window.Dropzone.forElement(".dropzone");
    for (let i = 0; i < files.length; i++) {
      dz.addFile(files[i]);
    }
    this.set('file', "");
  }),
  init() {
    let state = this.get('internalState');
    this.set("currentFolderId", state.getCurrentFolderID());
    // console.log("Heading into browse upload controller" );

    let currentNav = this.get("folderNavs").getCurrentFolderNavAndSetOn(this);

    // console.log(currentNav);

    if (currentNav != null) {
      this.set("currentNavCommand", currentNav.command);
      this.set("currentNavTitle", currentNav.name);
    }

    let bc = wrapFolder(state.getCurrentFolderID(), state.getCurrentFolderName());

    // console.log(bc);

    let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();
    if (fileBreadCrumbs == null) {
      fileBreadCrumbs = [];
      state.setCurrentFileBreadcrumbs(fileBreadCrumbs); // new collection, reset crumbs
    }

    this.set("currentBreadCrumb", bc);
    this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs()); // new collection, reset crumbs

    state.setCurrentBreadCrumb(bc);
  },
  actions: {
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

      //   alert("Folder clicked and delving into " + itemName);

      // console.log(newModel);
      // console.log(state.toString());

      myController.set("fileData", newModel);
    },
    navClicked: function (nav) {
      //   console.log("Folder Nav clicked " + nav.command);
      let controller = this;
      let state = this.get('internalState');

      let folderContents = null;
      let itemContents = null;

      state.setCurrentNavCommand(nav.command);
      this.set("currentNavCommand", nav.command);
      this.set("currentNavTitle", nav.name);

      if (nav.command === "home" || nav.command === "user_data" || nav.command === "workspace") {
        folderContents = this.store.query('folder', {
            "parentId": nav.parentId,
            "parentType": nav.parentType,
            "name": nav.name,
            reload: true,
            adapterOptions: {
              queryParams: {
                limit: "0"
              }
            }
          })
          .then(folders => {
            if (folders.length) {
              let folder_id = folders.content[0].id;

              state.setCurrentFolderID(folder_id);
              controller.set("currentFolderId", folder_id);

              itemContents = controller.store.query('item', {
                "folderId": folder_id
              });
              return controller.store.query('folder', {
                "parentId": folder_id,
                "parentType": "folder",
                reload: true,
                adapterOptions: {
                  queryParams: {
                    limit: "0"
                  }
                }
              });
            }
            throw new Error(nav.name + " folder not found.");
          })
          .catch(e => {
            console.log(["Failed to fetch contents of folder", e]);
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
        folderContents = this.store.query('resource', {
          "resources": payload,
          reload: true,
          adapterOptions: {
            queryParams: {
              limit: "0"
            }
          }
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
        .finally(_ => {
          controller.set("fileData", newModel);
        });

      state.setCurrentBreadCrumb(null);
      state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
      state.setCurrentFolderName("");
      this.set("currentBreadCrumb", null);
      this.set("fileBreadCrumbs", null);

    },
    itemClicked: function (item, isFolder) {
      let state = this.get('internalState');
      let myController = this;

      let itemID = item.get('_id');
      let itemName = item.get('name');

      if (isFolder === "true") {
        console.log("Item ID is " + itemID);

        // add to history (recent folders visited)
        state.addFolderToRecentFolders(itemID);

        state.setCurrentFolderID(itemID);
        state.setCurrentFolderName(itemName);

        this.set("currentFolderId", itemID);

        let previousBreadCrumb = state.getCurrentBreadCrumb();

        state.setCurrentBreadCrumb(item);

        let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();

        fileBreadCrumbs.push(previousBreadCrumb);

        state.setCurrentFileBreadcrumbs(fileBreadCrumbs);

        // console.log("State toString " + state.toString());
        this.set("currentBreadCrumb", state.getCurrentBreadCrumb());
        this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs());


        this.store.find('folder', itemID).then(function (folder) {
          // console.log(JSON.stringify(folder));
          // console.log(folder.get('parentId').toString());

          myController.set("parentId", folder.get('parentId'));

          state.setCurrentParentId(folder.get('parentId'));
          state.setCurrentParentType(folder.get('parentCollection'));

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

          myController.set("fileData", newModel);

          // console.log("State toString " + state.toString());

        });

      } else {
        myController.transitionToRoute('upload.view', item);
      }
    },

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

      //      console.log(newCrumbs);

      state.setCurrentFileBreadcrumbs(newCrumbs);
      state.setCurrentFolderID(item._id);
      state.setCurrentFolderName(item.name);
      state.setCurrentBreadCrumb(previousItem); // need to set this because itemClicked is expecting the previous breadcrumb.

      this.set('currentFolderId', item._id);

      this.send('itemClicked', Ember.Object.create(item), "true");
    },
    selectUpload() {
      Ember.$('.nice.upload.hidden').click();
    },
    openModal(modalName) {
      let modal = Ember.$('.ui.' + modalName + '.modal');
      modal.parent().prependTo(Ember.$(document.body));
      modal.modal('show');
    },
    insertNewFolder(folder) {
      let parentId = folder.get('parentId');
      let parentType = folder.get('parentCollection');

      let folderContents = this.store.query('folder', {
        parentId: parentId,
        parentType: parentType,
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });
      let itemContents = this.fileData.itemContents;
      let collections = this.fileData.collections;
      let newModel = {
        'folderContents': folderContents,
        'itemContents': itemContents,
        'collections': collections
      };
      this.set('fileData', newModel);
    }
  }
});
