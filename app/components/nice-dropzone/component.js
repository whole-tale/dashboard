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
    // dropzone_hidden: true,
    initialized_listeners: false,
    didRender() {
        Ember.$('.dropzone').addClass('hidden');
        this.resizeDropzone();
        if(!this.initialized_listeners) {
            let self = this;
            Ember.$('#dz-drag').on('dragover', this.showDropzone.bind(this));
            Ember.$('.dropzone').on('dragover', this.showDropzone.bind(this));
            Ember.$('#dz-drag').on('dragleave', function(evt) {
                window.clearTimeout(dragTimer);
                dragTimer = window.setTimeout(function() {
                    Ember.$('.dropzone').addClass('hidden');
                }, 85);
            });
            this.set('initialized_listeners', true);
        }
    },

    resizeDropzone() {
        let viewport = Ember.$(document);
        Ember.$('#dz-drag').height(viewport.height()-180);
        Ember.$('.dropzone .dz-message').height(viewport.height()-180);
    },

    showDropzone(evt) {
        let self = this;
        let dt = evt.originalEvent.dataTransfer;
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.includes('Files'))) {
            window.clearTimeout(dragTimer);
            Ember.$('.dropzone').removeClass('hidden');
        }
    }
});
