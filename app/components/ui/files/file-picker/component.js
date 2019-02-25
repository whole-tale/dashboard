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
  apiCall: service('api-call'),
  selectionTree: O({}),
  inputData: A(),
  entryPoint: O({}),
  loading: false,
  workspaceRootId: undefined,
  workspaceRoot: O({}),
  root: O({}),

  // ------------------------------------------------------------------------------------------------------------------------------
  init() {
    this._super(...arguments);
    const self = this;
      
    let failure = () => alert('Failed to find Tale workspace');
    let success = (workspaceRootId) => {
      let successId = (workspaceId) => {
        // Create the Tale Workspace  folder
        self.set('taleWorkspace', O({
          id : workspaceId,
          parentId: workspaceRootId,
          _parent: workspaceRootId,
          _modelType: "folder",
          name: 'Workspace',
          icon: 'folder',
          folders: A(),
          files: A()
        }));

        self.loadAllRelationships.call(self, self.get('taleWorkspace')).then(()=> {
          let userID = self.get('userAuth').getCurrentUserID();
          let root = O({
            id : undefined,
            _parent: undefined,
            _modelType: "user",
            folders: A(),
            files: A(),
            name: 'user'
          });
          root.folders.pushObject(self.get('taleWorkspace'));

          // Create the Home Directory folder
          self.set('homeDir', O({
            id : '5b7f14e84145320001601780',
            parentId: userID,
            _parent: userID,
            _modelType: "folder",
            name: 'Home',
            icon: 'home',
            folders: A(),
            files: A()
          }));

          self.loadAllRelationships.call(self, self.get('homeDir'), true).then(()=> {
            root.folders.pushObject(self.get('homeDir'));

            
            // Create the Tale Data folder
            self.set('dataDir', O({
              id : userID,
              parentId: userID,
              _parent: userID,
              _modelType: "folder",
              name: 'Data',
              icon: 'linkify',
              folders: A(),
              files: A()
            }));

            self.store.findRecord('tale', self.taleId)
            .then(tale => {
                let dataSetItems = tale.get('dataSet').map(dataset => {
                    let { itemId, mountPath, _modelType } = dataset;
                    return O({id: itemId, name: mountPath, _modelType, _parent: userID, folders: A(), files: A()});
                });
                dataSetItems.forEach((outer_item) => {
                self.loadAllRelationships.call(self, outer_item).then(()=> {
                  let dataDir = self.get('dataDir');
                  if (outer_item._modelType === 'folder') {
                    dataDir.folders.pushObject(outer_item);
                  }
                  else if (outer_item._modelType === 'item') {
                    dataDir.files.pushObject(outer_item);
                  }
                });
              });
              root.folders.pushObject(self.get('dataDir'));
              self.set('root', root);
            });
          });
        });
      };
      self.apiCall.getWorkspaceId(self.taleId, successId, failure);
    };
    self.apiCall.getWorkspaceRootId(success, failure);
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  loadFolders(folder, rootHome=false) {
    const store = this.get('store');
    const folderNavs = this.get('folderNavs');
    let navs = folderNavs.getFolderNavs();
    let self=this;
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
          .map(f => {
            let idx = navs.findIndex(n => n.name === f.name);
            if (idx > -1) {
              f.set('icon', navs[idx].icon);
              f.set('disallowImport', navs[idx].disallowImport);
            }
            return f;
          });
        folder.set('folders', folderContents);
/*         if(!rootHome) {
          self.send('checkFolder', folder);
        } */
        return folderContents;
      })
    ;
  },

  // ------------------------------------------------------------------------------------------------------------------------------
  loadFiles(folder, rootHome) {
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
          else {
            selectionTree[file.id]=O({
              id : file.id,
              parentId: folder.id,
              _modelType: "item",
              name: file.name,
            })
            selectionTree[file.id].set('_parent', folder)
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
  loadAllRelationships(folder, rootHome=false) {
    const self = this;
    if (folder._modelType === 'folder') {
    this.loadFolders(folder, rootHome)
      .then(folders => { 
        folders.forEach(innerFolder => {   
          innerFolder._parent = folder;
          self.loadAllRelationships.call(self, innerFolder, rootHome);
        });
      });

    
      this.loadFiles(folder, rootHome);
    }
    return Promise.resolve(A([]));
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
        parentId: parent? parent._id: undefined,
        type: 'folder'
      };
      self.send('partialCheck', parent);
      if (folder.files) {
      folder.files.forEach(file => {
        this.send('checkItem', file)
      });
    }
    if (folder.folders) {
      folder.folders.forEach(childFolder => {
        self.send('checkFolder', childFolder)
      });
    }
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
      if (folder._parent) {
      let parentId = folder._parent._id;
      if (_.get(selectionTree, parentId)) {
        this.send('uncheckParentFolders', folder._parent);
      }
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
