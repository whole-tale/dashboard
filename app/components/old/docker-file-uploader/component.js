/**
  @module wholetale
  @submodule file-uploader
*/

import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import { isEmpty } from '@ember/utils';

export default EmberUploader.FileField.extend({
  init() {
    this._super(...arguments);
  },

  filesDidChange: function(files) {
    const uploader = EmberUploader.Uploader.create({
      url: this.get('url')
    });

    if (!isEmpty(files)) {
      // this second argument is optional and can to be sent as extra data with the upload
      this.actions.action.call(this, files[0].name);
      // this.sendAction('action', files[0].name);
    }
  }
});


