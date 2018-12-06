import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

import $ from 'jquery';

import config from '../../../config/environment';

const taleStatus = Object.create({
  NONE: -1,
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
  SITE_ADMIN: 100
});


export default Component.extend({
  apiHost: config.apiHost,
  model: null,
  store: service(),
  init() {
    this._super(...arguments);
  },
  
  didRender() {
    // Enable the environment dropdown functionality
    $('.ui.dropdown').dropdown();
    this.selectDefaultImageId();
  },
  
  selectDefaultImageId() {
    // Select the current imageId by default
    const selectedImageId = this.getTale().get('imageId');
    $('.ui.dropdown').dropdown('set selected', selectedImageId);
  },
  
  getTale() {
    return this.model.selected.tale;
  },
  
  canEditTale: computed('model.selected.tale._accessLevel', function () {
    return this.getTale() && this.getTale().get('_accessLevel') >= taleStatus.WRITE;
  }).readOnly(),
  cannotEditTale: computed.not('canEditTale').readOnly(),
  
  actions: {
    updateTale() {
      const tale = this.getTale();
      const onFail = (e) => {
        alert('Error saving tale (' + tale['id'] + '):', e);
      };
      
      tale.save().catch(onFail);
    },
      
    setTaleEnvironment: function(selected) {
      const tale = this.getTale();
      tale.set('imageId', selected);
    },
  }
});