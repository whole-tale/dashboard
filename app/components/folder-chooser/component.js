import Ember from 'ember';
import RSVP from 'rsvp';
import config from '../../config/environment';
import layout from './template';

/**/
export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),
    authRequest: Ember.inject.service(),
    userAuth: Ember.inject.service(),

    folders: Ember.A(),    //Array of folders in the directory
    directory: null,       //The folder object currently browsed

    moveTo: null,
    fileToMove: null,

    getRoot: null,
    selectedRow: null,

    registered: {name: "Registered", id: "registered", type: "registered"},

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
            });
    }),

    getRootChanged: Ember.observer('getRoot', function() {
        this.set('loading', true);
        let self = this;
        let store = this.get('store');
        let getRoot = this.get('getRoot');

        if(getRoot === "registered") {
            store.query('folder', {adapterOptions:{registered: true}})
              .then(folderContents => {
                  self.set('directory', self.get('registered'));
                  self.set('folders', folderContents);
              })
              .finally(_ => {
                  self.set('loading', false);
              });
        }
        else {
            store.query('folder', { "parentId": getRoot.id, "parentType": getRoot.type})
              .then(folderContents => {
                  self.set('directory', {id: getRoot.id, type: getRoot.type, })
                  self.set('folders', folderContents);
              })
              .finally(_ => {
                  self.set('loading', false);
              });
        }
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
                });
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

            if (folder.name === "Registered") {
                self.set('directory', self.get('registered'));
                options = {adapterOptions:{registered: true}};
            }
            else {
                self.set('directory', {
                    id: folder.id,
                    type: "folder",
                    name: folder.get('name')
                });
            }

            store.query('folder', options)
                .then(folders => {
                    if(fileToMove) folders = folders.reject(f=>{return f.id === fileToMove.id;});
                    self.set('folders', folders);
                    self.set('moveTo', folder);
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    self.set('loading', false);
                });
        },

        clickedLevelUp() {
            this.set('loading', true);

            let self = this;

            let store = this.get('store');
            let directory = this.get('directory');
            let fileToMove = this.get('fileToMove');

            // let browsingDirectory = (directory.id === "registered") ? { id: this.get('userAuth').getCurrentUserID(), type: "user" } : { id: directory.id, type: directory.type };

            let promiseToFindParent;

            if(directory.id === "registered") {
                promiseToFindParent = new RSVP.Promise(resolve => {
                    resolve(Ember.Object.create({
                        parentId: self.get('userAuth').getCurrentUserID(),
                        parentCollection: "user"
                    }));
                });
            }
            else {
                promiseToFindParent = store.find(directory.type, directory.id);
            }

            promiseToFindParent
                .then(folder => {
                    let parentId = folder.get('parentId');
                    let parentType = folder.get('parentCollection');

                    self.set('directory', {type: parentType, id: parentId});
                    self.set('moveTo', folder);

                    return store.query('folder', { parentId: parentId, parentType: parentType});
                })
                .then(folders => {
                    if(fileToMove) folders = folders.reject(f=>{return f.id === fileToMove.id;});
                    self.set('folders', folders);
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    if(self.get('directory.type') === "folder") {
                        store.find('folder', self.get('directory').id)
                            .then(folder => {
                                self.set('directory.name', folder.get('name'));
                            });
                    };
                    self.set('loading', false);
                });
        },

        clickedRow(folder) {
            this.clearSelected();

            this.folders.find(f=>{return folder.id === f.id;}).set('selected', true);
            this.get('folders').arrayContentDidChange();

            //Grab the selected row from the event object so we can
            //highlight it to show it's been selected.
            let selectedRow = event.path.find(offset => {
                if(offset.classList)
                     return /selectable/.test(offset.classList.value);
            });
            this.set("selectedRow", Ember.$(selectedRow));
            this.selectedRow.css({background: "lightsteelblue"});

            //Save the item for when the user clicks on a menu action
            this.sendAction("onSelectedFolder", folder);
            this.set("selectedFolder", folder);
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
