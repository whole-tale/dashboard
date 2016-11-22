// app/pods/components/file-actions/component.js
import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';
import _ from 'lodash/lodash';

import UtilsMixin from 'ember-craft-repository/mixins/utils-mixin';


export default Ember.Component.extend(UtilsMixin, {
    layout,
    fileManager: Ember.inject.service(),
    store: Ember.inject.service(),
    classNames: ['file', 'actions'],
    file: null,
    newFileName: '',
    newFolderName: '',
    addedFiles: {},
    init() {
        this._super(...arguments);

        let file = this.get('file');
        this.set('newFileName', file.get('name'));
    },
    actions: {
        download() {
            let file = this.get('file');
            let url = this.get('fileManager').getDownloadUrl(file);
            window.open(url);
        },
        checkIn() {

        },
        checkOut() {

        },
        progress() {
            console.log(arguments);
        },
        updateContents(contents) {
            let file = this.get('file');
            let fm = this.get('fileManager');

            fm.updateContents(file, contents);
        },
        addSubfolder() {
            let self = this;

            let folder = this.get('file');
            let subFolderName = this.get('newFolderName');

            if (subFolderName) {
                this.get('fileManager').addSubfolder(folder, subFolderName)
                    .then(() => { self.sendAction('onRefreshFile', folder); });
            }
        },
        uploadFiles() {
            //TODO: Report errors back to the user in a friendly way
            let fm = this.get('fileManager');
            let folder = this.get('file');
            let addedFiles = this.get('addedFiles');

            let self = this;
            let _p = new RSVP.Promise(resolve => { resolve(true); });

            let _p_all = _.reduce(addedFiles, function(_p_each, file) {
                return fm.uploadFile(folder, file.name, file)
                    .then(() => { return _p_each; });
            }, _p);

            _p_all.then(() => { self.sendAction('onRefreshFile', folder); });
        },
        renameFile() {
            let self = this;

            let newName = this.get('newFileName');
            let file = this.get('file');

            if (newName && newName !== '') {
                this.get('fileManager').rename(file, newName)
                    .then(() => { self.sendAction('onRefreshFile', file); });
            }
        },
        deleteFile() {
            let self = this;
            let file = this.get('file');
            let parent = null;

            file.get('parentFolder')
                .then(_parent => {
                    parent = _parent;
                    return this.get('fileManager').deleteFile(file);
                })
                .then(() => { self.sendAction('onRefreshFile', parent); });
        },
        moveFile(folderId) {
            // let file = this.get('file');
            // let store = this.get('store');
            // store.findRecord('file', folderId).then((folder) => {
            //     // TODO:40 moving to file-provider root
            //     let options = {
            //         node: this.get('moveNode'),
            //         provider: folder.get('provider'),
            //         replace: this.get('moveReplace'),
            //         copy: this.get('moveCopy'),
            //         newName: this.get('moveName')
            //     };
            //
            //     this.get('fileManager').move(file, folder, options);
            // });
        },
        clearDropzone() {

        },
        openModal(name) {
            Ember.$('.ui.' + name + '.modal').modal('show');
        },
        closeModal(name) {
            Ember.$('.ui.' + name + '.modal').modal('hide');
        },
        addFileToDropzone(addedFile) {
            console.log(arguments);
            let addedFiles = this.get('addedFiles');
            addedFiles[addedFile.name] = addedFile;
            this.set('addedFiles', addedFiles);
        },
        removeFileFromDropzone(removedFile) {
            let addedFiles = this.get('addedFiles');
            delete addedFiles[removedFile.name];
            this.set('addedFiles', addedFiles);
        }
    },
});
