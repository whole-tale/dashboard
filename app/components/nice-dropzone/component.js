/*
  @module wholetale
  @submodule nice- dropzone
*/
import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';

import config from '../../config/environment';

var dragTimer;
var debounceTimeout;

export default Ember.Component.extend({
    layout,
    authRequest: Ember.inject.service(),
    tokenHandler: Ember.inject.service(),
    files: Ember.A(),
    processingQueue: false,
    deferredQueueComplete: RSVP.defer(),

    wrapFileData(file) {
        return {
            id: file.id,
            name: file.name,
            status: file.status,
            error: file.error,
            progress: file.upload.progress
        };
    },

    didRender() {
        let self = this;

        this.resizeDropzone();
        Ember.$('.droppable').on('dragover', this.showDropzone.bind(this));
        Ember.$('.dropzone').on('dragover', function(evt) {
            self.showDropzone.call(self, evt);
        });

        // Ember.run.schedule('afterRender', this, 'setDropzone');
    },

    didInsertElement() {
        this.initializeDropzone();
    },

    initializeDropzone() {
        let dz = window.Dropzone.forElement(".dropzone");
        dz.options.url = config.apiUrl + '/file/chunk';
        dz.options.paramName = "chunk";
        dz.options.headers = {'Girder-Token':this.get('tokenHandler').getWholeTaleAuthToken()};
        dz.on("addedfile", this.debounceAddedFile.bind(this));
        dz.on("sending", this.sending.bind(this));
        dz.on("uploadprogress", this.uploadProgress.bind(this));
        dz.on("success", this.uploadProgress.bind(this));
        dz.on("queuecomplete", this.queueComplete.bind(this));
        dz.on("error", this.error.bind(this));
        dz.on("canceled", this.uploadProgress.bind(this));
    },

    resizeDropzone() {
        let viewport = Ember.$('.component.context');
        Ember.$('.dropzone .dz-message').height(viewport.height());
    },

    showDropzone(evt) {
        let self = this;
        let dt = evt.originalEvent.dataTransfer;
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.includes('Files'))) {
            window.clearTimeout(dragTimer);
            Ember.$('.dropzone').removeClass('hidden');
        }
    },

    addedFile() {
        if(this.processingQueue) return;
        let self = this;
        let dz = window.Dropzone.forElement(".dropzone");
        Ember.$('.dropzone').addClass('hidden');

        this.set('processingQueue', true);
        this.showMessage();
        this.processQueue()
            .then(()=>{
                dz.processQueue();
                return self.deferredQueueComplete.promise;
            })
            .catch(e=>{
                console.log(e);
            })
            .finally(() => {
                self.set('processingQueue', false);
                self.cleanUpDropzone();
                self.sendAction('refresh');
            });
    },

    // Because of the way girder API works, we need to first create the
    // file before we can upload. Therefore, we must override default behavior
    // and prevent the dropzone from uploading any files.
    // Create each file in girder first, then upload each file.
    processQueue() {
        let self = this;
        let dz = window.Dropzone.forElement(".dropzone");
        let p_create_files = dz.files.reduce((p, file) => {
            p = p.then(() => {
                let url = config.apiUrl + '/file';
                let options = {
                    method: 'POST',
                    data: {
                        parentType: "folder",
                        parentId: self.folderId,
                        name: file.name,
                        size: file.size,
                        mimeType: file.type
                    }
                };
                return self.get('authRequest').send(url, options);
            })
            .then(rep => {
                file.id = rep._id;
                self.files.pushObject(self.wrapFileData(file));
            });
            return p;
        }, new RSVP.Promise(resolve=>{resolve(true);}));
        return p_create_files;
    },

    sending(file, xhr, formData) {
        formData.append("uploadId", file.id);
        formData.append("offset", 0);
    },

    uploadProgress(file) {
        let idx = this.files.findIndex(_file => {
            return file.id == _file.id;
        });
        this.files[idx] = this.wrapFileData(file);
        this.files.arrayContentDidChange(idx);
    },

    queueComplete() {
        this.deferredQueueComplete.resolve(true);
    },

    error(file) {
        file.error = file.xhr.statusText;
        this.uploadProgress(file);
    },

    cleanUpDropzone(params) {
        this.set('deferredQueueComplete', RSVP.defer());
        window.Dropzone.forElement(".dropzone").removeAllFiles();
    },

    showMessage() {
        let div = Ember.$('#upload-progress');
        div.removeClass('hidden');
    },

    hideDropzone() {
        window.clearTimeout(dragTimer);
        dragTimer = window.setTimeout(function() {
            Ember.$('.dropzone').addClass('hidden');
        }, 85);
    },

    debounceAddedFile() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(this.addedFile.bind(this), 100);
    },

    actions: {
        closeMessage() {
            Ember.$('#upload-progress').addClass('hidden');
            this.set('files', Ember.A());
            this.files.arrayContentDidChange();
        },

        cancelUploads(file) {
            let dz = window.Dropzone.forElement(".dropzone");
            dz.removeAllFiles(true);
        },
    }
});
