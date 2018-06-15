import Ember from 'ember';
import RSVP from 'rsvp';
import config from '../../../../config/environment';
import layout from './template';
import _ from 'lodash';

const service = Ember.inject.service.bind(Ember);

export default Ember.Component.extend({
  layout,

  store: service(),
  authRequest: service(),
  userAuth: service(),
  folderNavs: service(),
  wtEvents: service(),

  folders: Ember.A(),    //Array of folders in the directory
  files: Ember.A(),
  directory: null,       //The folder object currently browsed

  moveTo: null,
  fileToMove: null,

  selectedRow: null,
  updateSelected: false,

  // selectedItems: Ember.Object.create({}),
  // allSelected: Ember.A(),

  selectionTree: Ember.Object.create({}),
  inputData: Ember.A(),

  init() {
    this._super(...arguments);

    const self = this;
    const folderNavs = this.get('folderNavs');

    let store = this.get('store');
    let userID = this.get('userAuth').getCurrentUserID();
    
    let navs = folderNavs.getFolderNavs();
    this.set('directory', {id: userID, type: "user", selected: false});

    this.set('loading', true);

    let loadFolders = store.query('folder', { parentId: userID, parentType: "user"});

    loadFolders
      .then(folderContents => {
        self.set('directory', {id: userID, type: "user", })
        folderContents = folderContents
          .filter(f=>f.name!=='Workspace')
          .map(f=>{
            let idx = navs.findIndex(n=>n.name===f.name);
            if (idx > -1) {
              f.set('icon', navs[idx].icon);
              f.set('disallowImport', navs[idx].disallowImport);
            }
            return f;
          })
        ;
        self.set('folders', folderContents);
      })
    ;

    loadFolders
      .finally(() => {
        console.log("here");
        self.set('loading', false);
      })
    ;
  },

  //HACK: Initialize the mini browser. Find the file's parent folder. And then
  //      populate the 'folders' array.
  fileToMoveChanged: Ember.observer('fileToMove', function() {
    this.set('loading', true);

    let self = this;

    let store = this.get('store');
    let fileToMove = this.get('fileToMove');

    this.getFileParent(fileToMove)
      .then(folderMeta => {
        self.set('directory', folderMeta);
        return store.query('folder', { parentId: folderMeta.id, parentType: folderMeta.type});
      })
      .then(folders => {
        folders = folders.reject(f => {return f.id === fileToMove.id;});
        self.set('folders', folders);
      })
      .catch(e => {
        console.log(e);
      })
      .finally(_ => {
        self.set('loading', false);
      })
    ;
  }),

  clearSelected() {
    let previouslySelected = this.get('moveTo') || this.get('selectedFolder') || null;
    if(previouslySelected !== null) {
      let sel = this.folders.find(f=>{return previouslySelected.id === f.id;});
      if(sel) sel.set('selected', false);
      if(this.selectedRow) this.selectedRow.css({background: ""});
    }
    this.set('moveTo', null);
    this.set('selectedFolder', null);
    this.get('folders').arrayContentDidChange();
  },

  getFileParent(file) {
    let self = this;

    let promisedParentMeta;

    if(file.get('_modelType') === "folder") {
      promisedParentMeta = new RSVP.Promise(resolve => {
        resolve({
          id:   file.get('parentId'),
          type: file.get('parentCollection')
        });
      });
    }
    else {
      let url = config.apiUrl + "/item/" + file.get('id') + "/rootpath";
      promisedParentMeta = this.get('authRequest').send(url)
        .then(response => {
          let parent = response.pop();
          return {
            id:   parent.object._id,
            type: parent.type
          };
        })
      ;
    }

    return promisedParentMeta;
  },

  hasSiblingsChecked(item) {
    let selectionTree = this.get('selectionTree');
    let parentId = _.get(selectionTree, `${item.id}.parentId`);
    if (!parentId) return false;
  
    let keys = Object.keys(selectionTree);
    for(let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key !== item.id && selectionTree[key].parentId === parentId) return true;
    }
    return false;
  },

  actions: {
    clickedLevelDown(folder) {
      if (folder._modelType !== 'folder') return;
      this.clearSelected();

      this.set('loading', true);

      let self = this;

      let cwd = this.get('directory');
      let selectionTree = this.get('selectionTree');
      if (!_.get(selectionTree, folder.id)) {
        _.set(selectionTree, folder.id, {check:false, partialCheck:false, parentId: cwd.id, type: 'folder'})
      }

      let store = this.get('store');
      let fileToMove = this.get('fileToMove');
      let options = { parentId: folder.id, parentType: "folder"};
      folder.set('type', folder._modelType)
      self.set('directory', folder);

      let loadFolders = store.query('folder', options);
      let loadFiles = store.query('item', {folderId: folder.id});
    
      loadFolders
        .then(folders => {
          if (fileToMove) {
            folders = folders.reject(f=>f.id === fileToMove.id);
          }
          if (_.get(selectionTree, `${folder.id}.check`)) {
            folders.forEach(f => {
              selectionTree[f.id] = {check:true, partialCheck:false, parentId: folder.id, type: 'folder'};
            });
          }
          self.set('folders', folders);
          self.set('moveTo', folder);
        })
        .catch(e => {
          console.log(e);
        })
      ;

      loadFiles
        .then(files => {
          if (_.get(selectionTree, `${folder.id}.check`)) {
            files.forEach(f => {
              selectionTree[f.id] = {check:true, partialCheck:false, parentId: folder.id, type:'item'};
            });
          }
          self.set('files', files);
        })
        .catch(e => {
          console.log(e);
        })
      ;

      loadFolders
        .then(()=>loadFiles)
        .finally(() => {
          self.set('loading', false);
          self.set('selectionTree', Ember.Object.create(selectionTree));
        })
      ;
    },

    clickedLevelUp() {
      this.set('loading', true);

      let self = this;

      let store = this.get('store');
      let parent = this.get('directory');
      let fileToMove = this.get('fileToMove');

      let parentId = parent.get('parentId');
      let parentType = parent.get('parentCollection');

      self.set('directory', {type: parentType, id: parentId});
      self.set('moveTo', parent);

      let loadFiles = Promise.resolve([]),
          loadFolders = store.query('folder', { parentId: parentId, parentType: parentType});
      if (parentType === 'folder') {
        loadFiles = store.query('item', {folderId: parentId});
      }

      loadFolders
        .then(folders => {
          if(fileToMove) folders = folders.reject(f=>(f.id===fileToMove.id));
          folders = folders.reject(f=>f.name==='Workspace');
          self.set('folders', folders);
        })
        .catch(e => {
          console.log(e);
        })
      ;

      loadFiles
        .then(files => {
          self.set('files', files);
        })
        .catch(e => {
          console.log(e);
        })
      ;

      loadFolders.then(()=>loadFiles)
        .finally(() => {
          if(parentType === "folder") {
            store.find('folder', parentId)
              .then(folder => {
                self.set('directory', folder);
              })
            ;
          };
          self.set('loading', false);
        })
      ;
    },

    clickedRow(folder) {
      if(folder.selected) {
        return this.actions.clickedLevelDown.call(this, folder);
      }

      this.clearSelected();

      let onClickedRow = this.folders.find(f=>folder.id===f.id);
      if(onClickedRow) onClickedRow.set('selected', true);
      this.get('folders').arrayContentDidChange();

      //Grab the selected row from the event object so we can
      //highlight it to show it's been selected.
      let selectedRow = event.path.find(offset => {
        if(offset.classList) {
          return /selectable/.test(offset.classList.value);
        }
      });
      this.set("selectedRow", Ember.$(selectedRow));
      this.selectedRow.css({background: "lightsteelblue"});

      //Save the item for when the user clicks on a menu action
      this.sendAction("onSelectedFolder", folder);
      this.set("selectedFolder", folder);
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

      selectionTree[folder.id] = {check:true, partialCheck: false, parentId: cwd.id, type: 'folder'};

      this.send('partialCheck', cwd);

      inputData.addObject(folder);

      this.get('wtEvents').events.select(inputData);

      this.set('selectionTree', Ember.Object.create(selectionTree));
    },

    checkItem(item) {
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');
      let cwd = this.get('directory');

      selectionTree[item.id] = {check:true, partialCheck: false, parentId: cwd.id, type: 'item'};
      _.set(selectionTree, `${cwd.id}.partialCheck`, true);
      _.set(selectionTree, `${cwd.id}.check`, false);
      inputData.addObject(item);
      inputData = inputData.reject(i=>i.id===cwd.id);

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
        this.send('partialCheck', {id:parentId});
      }
    },

    uncheckParentFolders(folder) {
      let selectionTree = this.get('selectionTree');
      _.set(selectionTree, `${folder.id}.partialCheck`, false);
      _.set(selectionTree, `${folder.id}.check`, false);
      this.set('selectionTree', Ember.Object.create(selectionTree));
      let parentId = _.get(selectionTree, `${folder.id}.parentId`);
      if (_.get(selectionTree, parentId)) {
        this.send('uncheckParentFolders', {id:parentId});
      }
    },

    uncheckFolder(folder) {
      let selectionTree = this.get('selectionTree');
      let inputData = this.get('inputData');
      let cwd = this.get('directory');

      let folderId = folder.id;
      let keys = Object.keys(selectionTree);
      let removing = [{id:cwd.id}];
      for(let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (_.get(selectionTree, `${key}.parentId`) === folderId || key === folderId) {
          removing.push({id:key});
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
      let removing = [{id:cwd.id}, {id:item.id}];
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

    close() {
        this.sendAction("onClose");
        this.set('selected', null);
    },

    move() {
        if(!this.moveTo) {
            this.sendAction('onClose');
        }
        else if(this.moveTo.get('parentCollection') === "collection" && this.fileToMove.get('_modelType') !== "folder") {
            this.sendAction('onClose');
            console.log("Can't move a file move into a collection!");
        }
        else {
            this.sendAction('onClick', this.fileToMove, this.moveTo);
        }
        this.clearSelected();
    }
  }
});
