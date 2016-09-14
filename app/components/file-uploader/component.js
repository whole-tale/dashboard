/**
  @module wholetale
  @submodule file-uploader
*/

import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Component.extend({
  store: Ember.inject.service()
});

export default EmberUploader.FileField.extend({
  init() {
    this._super(...arguments);
    console.log("initializing file uploading component ...");
  },

  filesDidChange: function(files) {
    const uploader = EmberUploader.Uploader.create({
      url: this.get('url')
    });

    if (!Ember.isEmpty(files)) {
      // this second argument is optional and can to be sent as extra data with the upload
      alert("Uploading " + files[0].name );

      //uploader.upload(files[0], { });
    }
  }
});


