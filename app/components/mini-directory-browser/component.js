import Ember from 'ember';
import layout from './template';

/**/
export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),

    folders: Ember.A(),
    menuItems: null,

    moveTo: null,
    fileToMove: null,

    clearSelected() {
        let previouslySelected = this.get('moveTo');
        if(previouslySelected !== null) {
            this.folders.find(f=>{return previouslySelected.id === f.id}).set('selected', false);
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

        clickedRow(folder) {
            this.clearSelected();

            this.folders.find(f=>{return folder.id === f.id}).set('selected', true);
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
