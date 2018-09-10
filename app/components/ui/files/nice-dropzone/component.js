/*
  @module wholetale
  @submodule nice- dropzone
*/
import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';

import config from '../../../../config/environment';

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

  init() {
    this._super(...arguments);
    window.Dropzone.autoDiscover = false;
  },

  didRender() {
    let self = this;

    this.resizeDropzone();
    Ember.$('.droppable').on('dragover', this.showDropzone.bind(this));
    Ember.$('.dropzone').on('dragover', function (evt) {
      self.showDropzone.call(self, evt);
    });

    // Ember.run.schedule('afterRender', this, 'setDropzone');
  },

  didInsertElement() {
    try {
      this.initializeDropzone();
    } catch (e) {
      // Dropzone already initialized
    }
  },

  initializeDropzone() {
    let dz = window.Dropzone.forElement(".dropzone");
    dz.options.url = config.apiUrl + '/file/chunk';
    dz.options.paramName = "chunk";
    dz.options.headers = {
      'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken()
    };
    dz.options.autoProcessQueue = false;
    dz.options.parallelUploads = 1;
    dz.options.chunking = true;
    dz.options.maxFilesize = 1024;
    // Upload files larger than 100MB in 10MB chunks
    dz.options.chunkSize = 10485760;
    dz.options.params = function(files, xhr, chunk){
      return {
        uploadId: files[0].id,
        offset: (chunk !== null) ? chunk.index * dz.options.chunkSize : 0
      }
    };
    dz.on("addedfile", this.debounceAddedFile.bind(this));
    dz.on("uploadprogress", this.uploadProgress.bind(this));
    dz.on("success", this.uploadProgress.bind(this));
    dz.on("queuecomplete", this.queueComplete.bind(this));
    dz.on("error", this.error.bind(this));
    dz.on("canceled", this.canceled.bind(this));
    dz.on("removedfile", this.removedFile.bind(this));
    dz.on("complete", this.completeFile.bind(this));
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
    Ember.$('.dropzone').addClass('hidden');
    if (this.processingQueue) return;
    let self = this;
    let dz = window.Dropzone.forElement(".dropzone");

    this.set('processingQueue', true);
    this.showMessage();
    this.processQueue()
      .then(() => {
        dz.processQueue();
        return self.deferredQueueComplete.promise;
      })
      .catch(e => {
        console.log(e);
      })
      .finally(() => {
        dz.options.autoProcessQueue = false;
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
    }, new RSVP.Promise(resolve => {
      resolve(true);
    }));
    return p_create_files;
  },

  uploadProgress(file) {
    let idx = this.files.findIndex(_file => {
      return file.id == _file.id;
    });
    this.files[idx] = this.wrapFileData(file);
    this.files.arrayContentDidChange(idx);
  },

  canceled(file) {
    this.uploadProgress(file);
  },

  removedFile(file) {
    if (file.status === "queued") file.status = "canceled";
    this.uploadProgress(file);
  },

  completeFile(file) {
    let dz = window.Dropzone.forElement(".dropzone");
    dz.options.autoProcessQueue = true;
  },

  queueComplete(params) {
    this.deferredQueueComplete.resolve(true);
  },

  error(file, errorMessage) {
    file.error = errorMessage;
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
    dragTimer = window.setTimeout(function () {
      Ember.$('.dropzone').addClass('hidden');
    }, 10);
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

    cancelUploads() {
      let dz = window.Dropzone.forElement(".dropzone");
      dz.removeAllFiles(true);
      this.deferredQueueComplete.resolve(true);
    },
  }
});
