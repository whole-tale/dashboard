import Component from '@ember/component';
import EmberObject from '@ember/object';
import { A } from '@ember/array'; 
import layout from './template';
import {
  inject as service
} from '@ember/service';
import _ from 'lodash';

const O = EmberObject.create.bind(EmberObject);

export default Component.extend({
  layout,
  store: service(),
  folderNavs: service(),
  userAuth: service(),
  authRequest: service(),

  selectionTree: O({}),
  inputData: A(),
  entryPoint: O({}),

  loading: false,
  root: O({}),

  // ------------------------------------------------------------------------------------------------------------------------------
  init() {
    this._super(...arguments);
    const self = this;
      let selectionTree = self.get('selectionTree');
    this.getAndSelectTaleFiles().then(() => {
      let userID = self.get('userAuth').getCurrentUserID();
      self.set('root', O({
        id : userID,
        _modelType: "user",
        folders: A(),
        files: A()
      }));
  
      self.loadAllRelationships.call(self, self.root);
    })
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  getAndSelectTaleFiles() {
    let self = this;
    let selectionTree = this.get('selectionTree');
    return this.store.findRecord('tale', this.taleId)
      .then(tale => {
        return tale['involatileData'];
      })
      .then(involatileData => {
        involatileData.forEach(i => {
          selectionTree[i.id] = {
            check: true,
            partialCheck: false,
            type: i.type
          };
        });
        self.set('selectionTree', O(selectionTree));
        self.set('fileList', involatileData);
      })
    ;
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  loadFolders(folder) {
    const store = this.get('store');
    const folderNavs = this.get('folderNavs');
    let navs = folderNavs.getFolderNavs();

    let loadFolders = store.query('folder', {
      parentId: folder.id,
      parentType: folder._modelType,
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });

    return loadFolders
      .then(folderContents => {
        folderContents = folderContents
          .filter(f => f.name !== 'Workspace')
          .map(f => {
            let idx = navs.findIndex(n => n.name === f.name);
            if (idx > -1) {
              f.set('icon', navs[idx].icon);
              f.set('disallowImport', navs[idx].disallowImport);
            }
            return f;
          })
        ;
        folder.set('folders', folderContents);
        return folderContents;
      })
    ;
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  loadFiles(folder) {
    const store = this.get('store');
    const self = this;
    let loadFiles = store.query('item', {
      folderId: folder.id,
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });
    let selectionTree = this.get('selectionTree');
    let inputData = this.get('inputData');
    return loadFiles
      .then(files => {
        files.forEach(file => {
          if (selectionTree[file.id]) {
            selectionTree[file.id].parentId = folder.id;
            inputData.addObject(file);
          }
          file.set('_parent', folder);
        });
        self.set('inputData', A(inputData));
        self.set('selectionTree', O(selectionTree));
        folder.set('files', files);
      })
    ;
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  loadAllRelationships(folder) {
    const self = this;

    this.loadFolders(folder)
      .then(folders => { 
        folders.forEach(innerFolder => {   
          innerFolder._parent = folder;
          self.loadAllRelationships.call(self, innerFolder);
        });
      })
    ;

    if (folder._modelType === 'folder') {
      this.loadFiles(folder);
    }
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  removeParentsFromInputData(item) {
    let parent = item._parent;
    if (!parent) return;
    let inputData = this.get('inputData');
    inputData = inputData.reject(i => i.id === parent._id);
    this.set('inputData', A(inputData));
    if (parent._parent) {
      this.removeParentsFromInputData(parent);
    }
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  hasSiblingsChecked(item) {
    let selectionTree = this.get('selectionTree');
    let parentId = _.get(selectionTree, `${item.id}.parentId`);
    if (!parentId) return false;

    let keys = Object.keys(selectionTree);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key !== item.id && selectionTree[key].parentId === parentId && selectionTree[key].check) return true;
    }
    return false;
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  actions: {
    toggleExpandFolder(folder) {
      let expanded = !!folder.get('expanded');
      folder.set('expanded', !expanded);
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    checkEntry(file) {
      this.set('entryPoint', file);
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    uncheckEntry() {
      this.set('entryPoint', O({}));
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    check(item) {
      if (item._modelType === 'folder') {
        this.send('checkFolder', item);
      } else if (item._modelType === 'item') {
        this.send('checkItem', item);
      }
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    uncheck(item) {
      if (item._modelType === 'folder') {
        this.send('uncheckFolder', item);
      } else if (item._modelType === 'item') {
        this.send('uncheckItem', item);
      }
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    checkFolder(folder) {
      const self = this;
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');

      let parent = folder._parent;
      selectionTree[folder.id] = {
        check: true,
        partialCheck: false,
        parentId: parent._id,
        type: 'folder'
      };

      self.send('partialCheck', parent);

      inputData.addObject(folder);
      if (parent) {
        this.removeParentsFromInputData(folder);
      } else {
        self.set('inputData', A(inputData));
      }

      self.set('selectionTree', O(selectionTree));
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    checkItem(item) {
      const self = this;
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');

      let parent = item._parent;
      selectionTree[item.id] = {
        check: true,
        partialCheck: false,
        parentId: parent._id,
        type: 'item'
      };
      _.set(selectionTree, `${parent._id}.partialCheck`, true);
      _.set(selectionTree, `${parent._id}.check`, false);
      self.set('selectionTree', O(selectionTree));
      inputData.addObject(item);
      if (parent) {
        this.removeParentsFromInputData(item);
      } else {
        self.set('inputData', A(inputData));
      }

      self.send('partialCheck', parent);
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    partialCheck(folder) {
      let selectionTree = this.get('selectionTree');
      _.set(selectionTree, `${folder.id}.partialCheck`, true);
      _.set(selectionTree, `${folder.id}.check`, false);
      this.set('selectionTree', O(selectionTree));
      // let parentId = _.get(selectionTree, `${folder.id}.parentId`);
      if (folder._parent) {
        this.send('partialCheck', folder._parent);
      }
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    uncheckParentFolders(folder) {
      let selectionTree = this.get('selectionTree');
      _.set(selectionTree, `${folder.id}.partialCheck`, false);
      _.set(selectionTree, `${folder.id}.check`, false);
      this.set('selectionTree', O(selectionTree));
      let parentId = folder._parent._id;
      if (_.get(selectionTree, parentId)) {
        this.send('uncheckParentFolders', folder._parent);
      }
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    uncheckFolder(folder) {
      const self = this;
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');

      let parent = folder._parent;
      let folderId = folder.id;
      let keys = Object.keys(selectionTree);
      let removing = [{
        id: parent._id
      }];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (_.get(selectionTree, `${key}.parentId`) === folderId || key === folderId) {
          removing.push({
            id: key
          });
          _.set(selectionTree, `${key}.partialCheck`, false);
          _.set(selectionTree, `${key}.check`, false);
          self.set('selectionTree', O(selectionTree));
        }
      }

      _.pullAllBy(inputData, removing, 'id');
      inputData.arrayContentDidChange();

      folder.folders.forEach(f => {
          this.send('uncheckFolder', f);
      });
      folder.files.forEach(f => {
          this.send('uncheckItem', f);
      });

      if (self.hasSiblingsChecked(folder)) {
        _.set(selectionTree, `${parent._id}.partialCheck`, true);
        _.set(selectionTree, `${parent._id}.check`, false);
        self.set('selectionTree', O(selectionTree));
      } else if (parent._parent) {
        self.send('uncheckParentFolders', parent);
      }

      self.set('inputData', A(inputData));
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    uncheckItem(item) {
      const self = this;
      let inputData = this.get('inputData');
      let selectionTree = this.get('selectionTree');

      let parent = item._parent;
      _.set(selectionTree, `${item.id}.check`, false);
      let removing = [{id: parent._id}, {id: item.id}];
      _.pullAllBy(inputData, removing, 'id');
      inputData.arrayContentDidChange();
      self.set('selectionTree', O(selectionTree));

      if (self.hasSiblingsChecked(item)) {
        _.set(selectionTree, `${parent._id}.partialCheck`, true);
        _.set(selectionTree, `${parent._id}.check`, false);
        self.set('selectionTree', O(selectionTree));
      } else {
        self.send('uncheckParentFolders', parent);
      }

      self.set('inputData', A(inputData));
    },
  }
});