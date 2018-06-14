import Ember from 'ember';
import RSVP from 'rsvp';
import config from '../../../../config/environment';
import layout from './template';

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

  selectedItems: Ember.Object.create({}),
  allSelected: Ember.A(),

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

  actions: {
    clickedLevelDown(folder) {
      this.clearSelected();

      this.set('loading', true);

      let self = this;

      let store = this.get('store');
      let fileToMove = this.get('fileToMove');
      let options = { parentId: folder.id, parentType: "folder"};

      self.set('directory', {
        id: folder.id,
        type: "folder",
        name: folder.get('name')
      });

      let loadFolders = store.query('folder', options);
      let loadFiles = store.query('item', {folderId: folder.id});

      loadFolders
        .then(folders => {
          if (fileToMove) {
            folders = folders.reject(f=>f.id === fileToMove.id);
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
        })
      ;
    },

    clickedLevelUp() {
      this.set('loading', true);

      let self = this;

      let store = this.get('store');
      let directory = this.get('directory');
      let fileToMove = this.get('fileToMove');

      store.find(directory.type, directory.id)
        .then(folder => {
          let parentId = folder.get('parentId');
          let parentType = folder.get('parentCollection');

          self.set('directory', {type: parentType, id: parentId});
          self.set('moveTo', folder);

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

          return loadFolders.then(()=>loadFiles);
        })
        .finally(() => {
          if(self.get('directory.type') === "folder") {
            store.find('folder', self.get('directory').id)
              .then(folder => {
                self.set('directory.name', folder.get('name'));
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

    selectItem(item) {
      let selectedItems = this.get('selectedItems');
      selectedItems.set(item.id, true);
      this.set('selectedItems', Ember.Object.create(selectedItems));
      this.allSelected.pushObject(item);
      this.get('wtEvents').events.select(this.allSelected);
    },

    deselectItem(item) {
      let selectedItems = this.get('selectedItems');
      selectedItems.set(item.id, false);
      this.set('selectedItems', Ember.Object.create(selectedItems));
      this.allSelected.removeObject(item);
      this.get('wtEvents').events.select(this.allSelected);
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
