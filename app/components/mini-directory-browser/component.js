import Ember from 'ember';
import RSVP from 'rsvp';
import config from '../../config/environment';
import layout from './template';

/**/
export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),
    authRequest: Ember.inject.service(),

    folders: Ember.A(),    //Array of folders in the directory
    directory: null,       //The folder object currently browsed

    moveTo: null,
    fileToMove: null,

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
                folders = folders.reject(f=>{return f.id === fileToMove.id;});
                self.set('folders', folders);
            })
            .catch(e => {
                console.log(e);
            })
            .finally(_ => {
                self.set('loading', false);
            });
    }),

    clearSelected() {
        let previouslySelected = this.get('moveTo');
        if(previouslySelected !== null) {
            this.folders.find(f=>{return previouslySelected.id === f.id;}).set('selected', false);
        }
        this.set('moveTo', null);
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

            self.set('directory', {
                id: folder.id,
                type: "folder"
            });

            store.query('folder', { parentId: folder.id, parentType: "folder"})
                .then(folders => {
                    folders = folders.reject(f=>{return f.id === fileToMove.id;});
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

            store.find(directory.type, directory.id)
                .then(folder => {
                    let parentId = folder.get('parentId');
                    let parentType = folder.get('parentCollection');

                    self.set('directory', {type: parentType, id: parentId});
                    self.set('moveTo', folder);

                    return store.query('folder', { parentId: parentId, parentType: parentType});
                })
                .then(folders => {
                    folders = folders.reject(f=>{return f.id === fileToMove.id;});
                    self.set('folders', folders);
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    self.set('loading', false);
                });
        },

        clickedRow(folder) {
            this.clearSelected();

            this.folders.find(f=>{return folder.id === f.id;}).set('selected', true);
            this.set('moveTo', folder);
            this.get('folders').arrayContentDidChange();
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
                console.log("Moving ");
                console.log(this.fileToMove);
                console.log(this.moveTo);
                this.sendAction('onClick', this.fileToMove, this.moveTo);
            }
            this.clearSelected();
        }
    }
});
