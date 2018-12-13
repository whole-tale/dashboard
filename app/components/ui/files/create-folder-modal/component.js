import Component from '@ember/component';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import layout from './template';

export default Component.extend({
    layout,
    store: service(),
    internalState: service(),

    folderName: '',

    clearModal() {
        $('.ui.dropdown').dropdown('clear');
        this.set('folderName', '');
    },

    actions: {
        createFolder() {
            let self = this;
            let state = this.get('internalState');

            let parentId = state.getCurrentFolderID();
            let parentType = 'folder';  //state.getCurrentFolderType();

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
