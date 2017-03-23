import Ember from 'ember';
import layout from './template';

/**/
export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),

    fileToMoveChanged: Ember.observer('fileToMove', function() {
        let self = this;
        let store = this.get('store');
        let fileToMove = this.get('fileToMove');

        let parentId = fileToMove.get('parentId');
        let parentType = fileToMove.get('parentCollection');

        if(this.get('browsingFolderId') === parentId) return;
        this.set('browsingFolderId', parentId);

        store.find(parentType, parentId)
            .then(folder => {
                return store.query(parentType, { parentId: parentId, parentType: parentType});
            })
            .then(folders => {
                folders = folders.reject(f=>{return f.id === fileToMove.id;});
                self.set('folders', folders);
            });
    }),

    folders: Ember.A(),
    browsingFolderId: null,

    moveTo: null,
    fileToMove: null,

    clearSelected() {
        let previouslySelected = this.get('moveTo');
        if(previouslySelected !== null) {
            this.folders.find(f=>{return previouslySelected.id === f.id;}).set('selected', false);
        }
        this.set('moveTo', null);
        this.get('folders').arrayContentDidChange();
    },

    actions: {
        clickedNextFolder(folder) {
            this.clearSelected();

            let self = this;
            let store = this.get('store');

            let itemId = folder.get('id');
            store.find('folder', itemId).then(folder => {
                let folderContents = store.query('folder', { parentId: itemId, parentType: "folder"});
                self.set('folders', folderContents);
                self.get('folders').arrayContentDidChange();
            });
        },

        clickedLevelUp() {
            let parentType = this.fileToMove.get('parentCollection');
            let parentId = this.fileToMove.get('parentId');

            if(parentType === "collection") {
                return;  // Can't move files to collections
            }


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
            else {
                this.sendAction('onClick', this.fileToMove, this.moveTo);
            }
            this.clearSelected();
        }
    }
});
