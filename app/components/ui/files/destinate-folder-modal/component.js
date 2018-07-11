import Ember from 'ember';
import layout from './template';

const service = Ember.inject.service.bind(Ember);

export default Ember.Component.extend({
  layout,

  fileToMove: null,

  store: service(),
  userAuth: service(),
  folderNavs: service(),

  folders: Ember.A(),    //Array of folders in the directory
  
  destinationFolder: Ember.Object.create({}),
  previousFolder: Ember.Object.create({}),
  selectionTree: Ember.Object.create({}),
  directory: Ember.Object.create({}),

  clearModal() {
    this.set('destinationFolder', Ember.Object.create({}));
    this.set('previousFolder', Ember.Object.create({}));
    this.set('selectionTree', Ember.Object.create({}));
    this.set('directory', Ember.Object.create({}));
    this.set('folders', Ember.A());
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
        folderContents = folderContents
          .filter(f=>(f.name!=='Workspace' && f.name!=='Data'))
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
        self.set('loading', false);
      })
    ;
  },

  init() {
    this._super(...arguments);
    this.clearModal();
  },

  actions: {
    moveFile() {
      let destinationFolder = this.get('destinationFolder');
      if(destinationFolder.get('parentCollection') === "collection" && this.fileToMove.get('_modelType') !== "folder") {
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

      store.query('folder', { parentId: folder.id, parentType: "folder"})
        .then(folders => {
          if (fileToMove) {
            folders = folders.reject(f=>f.id === fileToMove.id);
          }
          self.set('folders', folders);
        })
        .catch(e => {
          console.log(e);
        })
        .finally(() => {
          self.set('directory', folder);
          self.set('loading', false);
        })
      ;
    },

    clickBack() {
      this.set('loading', true);

      let self = this;
      let store = this.get('store');
      let parent = this.get('directory');
      let fileToMove = this.get('fileToMove');
      let parentId = parent.get('parentId');
      let parentType = parent.get('parentCollection');
      
      self.set('directory', {type: parentType, id: parentId});
      
      store.query('folder', { parentId: parentId, parentType: parentType})
        .then(folders => {
          if(fileToMove) folders = folders.reject(f=>(f.id===fileToMove.id));
          folders = folders.reject(f=>(f.name==='Workspace' || f.name==='Data'));
          self.set('folders', folders);
        })
        .catch(e => {
          console.log(e);
        })
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

    check(folder) {
      let selectionTree = {};
      selectionTree[folder.id] = {check:true};
      this.set('selectionTree', Ember.Object.create(selectionTree));
      this.set('destinationFolder', folder);
    },

    uncheck(folder) {
      this.set('destinationFolder', Ember.Object.create({}));
      this.set('selectionTree', Ember.Object.create({}));
    }
  }
});