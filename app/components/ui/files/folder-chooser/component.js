import Ember from 'ember';
import layout from './template';
import _ from 'lodash';

const service = Ember.inject.service.bind(Ember);

export default Ember.Component.extend({
  layout,

  store: service(),
  userAuth: service(),
  folderNavs: service(),
  wtEvents: service(),

  folders: Ember.A(), //Array of folders in the directory
  files: Ember.A(),
  directory: null, //The folder object currently browsed

  selectionTree: Ember.Object.create({}),
  inputData: Ember.A(),

  init() {
    this._super(...arguments);

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
        self.set('directory', {
          id: userID,
          type: "user",
        })
        folderContents = folderContents
          .filter(f => f.name !== 'Workspace')
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

  hasSiblingsChecked(item) {
    let selectionTree = this.get('selectionTree');
    let parentId = _.get(selectionTree, `${item.id}.parentId`);
    if (!parentId) return false;

    let keys = Object.keys(selectionTree);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key !== item.id && selectionTree[key].parentId === parentId) return true;
    }
    return false;
  },

  actions: {
    clickedLevelDown(folder) {
      if (folder._modelType !== 'folder') return;

      this.set('loading', true);

      let self = this;

      let cwd = this.get('directory');
      let selectionTree = this.get('selectionTree');
      if (!_.get(selectionTree, folder.id)) {
        _.set(selectionTree, folder.id, {
          check: false,
          partialCheck: false,
          parentId: cwd.id,
          type: 'folder'
        })
      }

      let store = this.get('store');
      let options = {
        parentId: folder.id,
        parentType: "folder",
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      };
      folder.set('type', folder._modelType)
      self.set('directory', folder);

      let loadFolders = store.query('folder', options);
      let loadFiles = store.query('item', {
        folderId: folder.id,
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });

      loadFolders
        .then(folders => {
          if (_.get(selectionTree, `${folder.id}.check`)) {
            folders.forEach(f => {
              selectionTree[f.id] = {
                check: true,
                partialCheck: false,
                parentId: folder.id,
                type: 'folder'
              };
            });
          }
          self.set('folders', folders);
        })
        .catch(e => {
          console.log(e);
        });

      loadFiles
        .then(files => {
          if (_.get(selectionTree, `${folder.id}.check`)) {
            files.forEach(f => {
              selectionTree[f.id] = {
                check: true,
                partialCheck: false,
                parentId: folder.id,
                type: 'item'
              };
            });
          }
          self.set('files', files);
        })
        .catch(e => {
          console.log(e);
        });

      loadFolders
        .then(() => loadFiles)
        .finally(() => {
          self.set('loading', false);
          self.set('selectionTree', Ember.Object.create(selectionTree));
        });
    },

    clickedLevelUp() {
      this.set('loading', true);

      let self = this;

      let store = this.get('store');
      let parent = this.get('directory');

      let parentId = parent.get('parentId');
      let parentType = parent.get('parentCollection');

      self.set('directory', {
        type: parentType,
        id: parentId
      });

      let loadFiles = Promise.resolve([]);
      let loadFolders = store.query('folder', {
        parentId: parentId,
        parentType: parentType,
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      });
      if (parentType === 'folder') {
        loadFiles = store.query('item', {
          folderId: parentId,
          reload: true,
          adapterOptions: {
            queryParams: {
              limit: "0"
            }
          }
        });
      }

      loadFolders
        .then(folders => {
          folders = folders.reject(f => f.name === 'Workspace');
          self.set('folders', folders);
        })
        .catch(e => {
          console.log(e);
        });

      loadFiles
        .then(files => {
          self.set('files', files);
        })
        .catch(e => {
          console.log(e);
        });

      loadFolders.then(() => loadFiles)
        .finally(() => {
          if (parentType === "folder") {
            store.find('folder', parentId)
              .then(folder => {
                self.set('directory', folder);
              });
          };
          self.set('loading', false);
        });
    },

    check(item) {
      if (item._modelType === 'folder') {
        this.send('checkFolder', item);
      } else if (item._modelType === 'item') {
        this.send('checkItem', item);
      }
    },

    uncheck(item) {
      if (item._modelType === 'folder') {
        this.send('uncheckFolder', item);
      } else if (item._modelType === 'item') {
        this.send('uncheckItem', item);
      }
    },

    checkFolder(folder) {
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');
      let cwd = this.get('directory');

      selectionTree[folder.id] = {
        check: true,
        partialCheck: false,
        parentId: cwd.id,
        type: 'folder'
      };

      this.send('partialCheck', cwd);

      inputData.addObject(folder);

      this.get('wtEvents').events.select(inputData);

      this.set('selectionTree', Ember.Object.create(selectionTree));
    },

    checkItem(item) {
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');
      let cwd = this.get('directory');

      selectionTree[item.id] = {
        check: true,
        partialCheck: false,
        parentId: cwd.id,
        type: 'item'
      };
      _.set(selectionTree, `${cwd.id}.partialCheck`, true);
      _.set(selectionTree, `${cwd.id}.check`, false);
      inputData.addObject(item);
      inputData = inputData.reject(i => i.id === cwd.id);

      this.send('partialCheck', cwd);

      this.get('wtEvents').events.select(inputData);

      this.set('selectionTree', Ember.Object.create(selectionTree));
    },

    partialCheck(folder) {
      let selectionTree = this.get('selectionTree');
      _.set(selectionTree, `${folder.id}.partialCheck`, true);
      _.set(selectionTree, `${folder.id}.check`, false);
      this.set('selectionTree', Ember.Object.create(selectionTree));
      let parentId = _.get(selectionTree, `${folder.id}.parentId`);
      if (_.get(selectionTree, parentId)) {
        this.send('partialCheck', {
          id: parentId
        });
      }
    },

    uncheckParentFolders(folder) {
      let selectionTree = this.get('selectionTree');
      _.set(selectionTree, `${folder.id}.partialCheck`, false);
      _.set(selectionTree, `${folder.id}.check`, false);
      this.set('selectionTree', Ember.Object.create(selectionTree));
      let parentId = _.get(selectionTree, `${folder.id}.parentId`);
      if (_.get(selectionTree, parentId)) {
        this.send('uncheckParentFolders', {
          id: parentId
        });
      }
    },

    uncheckFolder(folder) {
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');
      let cwd = this.get('directory');

      let folderId = folder.id;
      let keys = Object.keys(selectionTree);
      let removing = [{
        id: cwd.id
      }];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (_.get(selectionTree, `${key}.parentId`) === folderId || key === folderId) {
          removing.push({
            id: key
          });
          _.set(selectionTree, `${key}.partialCheck`, false);
          _.set(selectionTree, `${key}.check`, false);
          if (selectionTree[key].type === 'folder' && key !== folderId) {
            this.send('uncheckFolder', selectionTree[key]);
          }
        }
      }
      _.pullAllBy(inputData, removing, 'id');
      inputData.arrayContentDidChange();

      this.folders.forEach(f => {
        if (_.get(selectionTree, `${f.id}.check`)) {
          inputData.addObject(f);
        }
      });
      this.files.forEach(f => {
        if (_.get(selectionTree, `${f.id}.check`)) {
          inputData.addObject(f);
        }
      });
      if (this.hasSiblingsChecked(folder)) {
        _.set(selectionTree, `${cwd.id}.partialCheck`, true);
        _.set(selectionTree, `${cwd.id}.check`, false);
      } else {
        this.send('uncheckParentFolders', cwd);
        // _.set(selectionTree, `${cwd.id}.partialCheck`, false);
        // _.set(selectionTree, `${cwd.id}.check`, false);
      }

      this.get('wtEvents').events.select(inputData);

      this.set('selectionTree', Ember.Object.create(selectionTree));
    },

    uncheckItem(item) {
      let inputData = this.get('inputData');
      let selectionTree = this.get('selectionTree');
      let cwd = this.get('directory');

      _.set(selectionTree, `${item.id}.check`, false);
      let removing = [{
        id: cwd.id
      }, {
        id: item.id
      }];
      _.pullAllBy(inputData, removing, 'id');
      inputData.arrayContentDidChange();
      this.folders.forEach(f => {
        if (_.get(selectionTree, `${f.id}.check`)) {
          inputData.addObject(f);
        }
      });
      this.files.forEach(f => {
        if (_.get(selectionTree, `${f.id}.check`)) {
          inputData.addObject(f);
        }
      });
      if (this.hasSiblingsChecked(item)) {
        _.set(selectionTree, `${cwd.id}.partialCheck`, true);
        _.set(selectionTree, `${cwd.id}.check`, false);
      } else {
        this.send('uncheckParentFolders', cwd);
      }
      this.get('wtEvents').events.select(inputData);

      this.set('selectionTree', Ember.Object.create(selectionTree));
    },
  }
});
