/*
  @module wholetale
  @submodule gddropzone
*/
import Ember from 'ember';
import layout from './template';

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
    layout,
    files: Ember.A(),

    didRender() {
        let self = this;

        this.resizeDropzone();
        Ember.$('.dropzone').addClass('hidden');
        Ember.$('.droppable').on('dragover', this.showDropzone.bind(this));
        Ember.$('.dropzone').on('dragover', function(evt) {
            self.showDropzone.call(self, evt);
        });
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

    actions: {
        cleanUpDropzone(params) {
            this.files.pushObject(params);
            this.set('processing', true);
            window.Dropzone.forElement(".dropzone").removeAllFiles();
            Ember.$('.dropzone').addClass('hidden');
        },

        closeMessage() {
            Ember.$('.message').addClass('hidden');
            this.set('files', Ember.A());
        },

        showMessage() {
            Ember.$('.message').removeClass('hidden');
        },

        hideDropzone() {
            window.clearTimeout(dragTimer);
            dragTimer = window.setTimeout(function() {
                Ember.$('.dropzone').addClass('hidden');
            }, 85);
        }
    }
});
