/*
  @module wholetale
  @submodule gddropzone
*/
import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';

import config from '../../config/environment';

var dragTimer;

// A google drive like dropzone.
// Intended to mimic how google drive handles file uploads.
// How I'd like for this to behave:
//   0) Dropzone is initially hidden
//   1) Show dropzone when dragging files (not folders or page elements)
//      over the page.
//   2) Re-hide when dropped
//   3) Show file upload progress pane in lower right.
//   4) On complete, check for errors and display green check or red X
//      in the upload progress pane.
export default Ember.Component.extend({
    authRequest: Ember.inject.service(),
    tokenHandler: Ember.inject.service(),
    layout,
    files: Ember.A(),
    dropzone: null,

    didRender() {
        let self = this;

        Ember.$('.dropzone').addClass('hidden');

        this.resizeDropzone();
        Ember.$('.droppable').on('dragover', this.showDropzone.bind(this));
        Ember.$('.dropzone').on('dragover', function(evt) {
            self.showDropzone.call(self, evt);
        });

        // Ember.run.schedule('afterRender', this, 'setDropzone');
    },

    didInsertElement() {
        let dz = window.Dropzone.forElement(".dropzone");
        dz.options.url = config.apiUrl + '/file/chunk';
        dz.options.paramName = "chunk";
        dz.options.headers = {'Girder-Token':this.get('tokenHandler').getWholeTaleAuthToken()};
        dz.on("addedfile", this.addedFile.bind(this));
        dz.on("sending", this.sending.bind(this));
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
        let self = this;
        let dz = window.Dropzone.forElement(".dropzone");
        Ember.$('.dropzone').addClass('hidden');

        this.showMessage();
        this.processQueue()
            .then(()=>{
                dz.processQueue();
            })
            .catch(e=>{
                console.log(e);
            })
            .finally(() => {
                self.cleanUpDropzone();
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
            });
            return p;
        }, new RSVP.Promise(resolve=>{resolve(true)}));
        return p_create_files;
    },

    sending(file, xhr, formData) {
        formData.append("uploadId", file.id);
        formData.append("offset", 0);
    },

    //
    // errorHandler(e, message, xhr) {
    //     console.log(params);
    // },
    //

    cleanUpDropzone(params) {
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

    actions: {
        closeMessage() {
            Ember.$('#upload-progress').addClass('hidden');
            // this.set('files', Ember.A());
        }
    }
});
