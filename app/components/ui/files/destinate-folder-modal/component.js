import Component from '@ember/component';
import EmberObject as Object from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import layout from './template';

export default Component.extend({
  layout,

  fileToMove: null,

  store: service(),
  userAuth: service(),
  folderNavs: service(),

  folders: A(), //Array of folders in the directory

  destinationFolder: Object.create({}),
  previousFolder: Object.create({}),
  selectionTree: Object.create({}),
  directory: Object.create({}),

  clearModal() {
    this.set('destinationFolder', Object.create({}));
    this.set('previousFolder', Object.create({}));
    this.set('selectionTree', Object.create({}));
    this.set('directory', Object.create({}));
    this.set('folders', A());
    const self = this;
    const folderNavs = this.get('folderNavs');

    let store = this.get('store');
    let userID = this.get('userAuth').getCurrentUserID();

    let navs = folderNavs.getFolderNavs();
    this.set('directory', {
      id: userID,
      type: "user",
      selected: false
    });

    this.set('loading', true);

    let loadFolders = store.query('folder', {
      parentId: userID,
      parentType: "user",
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });

    loadFolders
      .then(folderContents => {
        folderContents = folderContents
          .filter(f => (f.name !== 'Workspace'))
          .map(f => {
            let idx = navs.findIndex(n => n.name === f.name);
            if (idx > -1) {
              f.set('icon', navs[idx].icon);
              f.set('disallowImport', navs[idx].disallowImport);
            }
            return f;
          });
        self.set('folders', folderContents);
      });

    loadFolders
      .finally(() => {
        self.set('loading', false);
      });
  },

  init() {
    this._super(...arguments);
    this.clearModal();
  },

  actions: {
    moveFile() {
      let destinationFolder = this.get('destinationFolder');
      if (destinationFolder.get('parentCollection') === "collection" && this.fileToMove.get('_modelType') !== "folder") {
        console.log("Can't move a file move into a collection!");
      } else {
        this.sendAction('onMoveFile', this.fileToMove, destinationFolder);
      }
      this.clearModal();
    },

    cancel() {
      this.clearModal();
    },

    clickFolder(folder) {
      this.set('loading', true);

      let self = this;
      let fileToMove = this.get('fileToMove');
      let store = this.get('store');

      store.query('folder', {
        parentId: folder.id,
        parentType: "folder",
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }).then(folders => {
        if (fileToMove) {
          folders = folders.reject(f => f.id === fileToMove.id);
        }
        self.set('folders', folders);
      })
        .catch(e => {
          console.log(e);
        })
        .finally(() => {
          self.set('directory', folder);
          self.set('loading', false);
        });
    },

    clickBack() {
      this.set('loading', true);

      let self = this;
      let store = this.get('store');
      let parent = this.get('directory');
      let fileToMove = this.get('fileToMove');
      let parentId = parent.get('parentId');
      let parentType = parent.get('parentCollection');

      self.set('directory', {
        type: parentType,
        id: parentId
      });

      store.query('folder', {
        parentId: parentId,
        parentType: parentType,
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }).then(folders => {
        if (fileToMove) {
          folders = folders.reject(f => (f.id === fileToMove.id));
        }
        folders = folders.reject(f => (f.name === 'Workspace'));
        self.set('folders', folders);
      }).catch(e => {
        console.log(e);
      }).finally(() => {
        if (parentType === "folder") {
          store.find('folder', parentId).then(folder => {
            self.set('directory', folder);
          });
        }
        self.set('loading', false);
      });
    },

    check(folder) {
      let selectionTree = {};
      selectionTree[folder.id] = {
        check: true
      };
      this.set('selectionTree', Object.create(selectionTree));
      this.set('destinationFolder', folder);
    },

    uncheck(folder) {
      this.set('destinationFolder', Object.create({}));
      this.set('selectionTree', Object.create({}));
    }
  }
});
