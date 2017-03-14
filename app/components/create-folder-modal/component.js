import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    store: Ember.inject.service(),
    internalState: Ember.inject.service(),

    folderName: '',

    clearModal() {
        Ember.$('.ui.dropdown').dropdown('clear');

        this.set('folderName', '');
    },

    actions: {
        createFolder() {
            let self = this;
            let parentId, parentType, folderId = this.get('internalState').getCurrentFolderID();
            if(folderId === "null") {
                parentId = this.get('internalState').getCurrentCollectionID();
                parentType = "collection";
            }
            else {
                parentId = folderId;
                parentType = "folder";
            }

            let queryParams = {
                parentType: parentType,
                parentId: parentId,
                name: this.folderName
            };

            let newFolder = this.get('store').createRecord('folder', {});
            newFolder.save({ adapterOptions: {queryParams: queryParams} })
                .then(folder => {
                    self.sendAction("onNewFolder", folder);
                });

            this.clearModal();
        },

        cancel() {
            this.clearModal();
        }
    }
});
