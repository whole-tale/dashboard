import Component from '@ember/component';
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
  environments: [],
  licenses: [],
  model: null,
  publishedURL: 'This Tale has not been published',
  init() {
    this._super(...arguments);
    
    // Fetch images for user to select an environment
    const component = this;
    $.getJSON(this.get('apiHost') + '/api/v1/image/').then(function(images) {
      component.set('environments', images);
      component.selectDefaultImageId();
    });

    // Fetch licenses for users to select
    $.getJSON(this.get('apiHost') + '/api/v1/license/').then(function(licenses) {
      component.set('licenses', licenses);
      component.selectDefaultLicense();
    });

    const tale = this.get('model').get('tale');
    let uri = tale.publishedURI;
    if (tale.publishInfo && tale.publishInfo.length) {
      this.set('publishedURL', tale.publishInfo[tale.publishInfo.length - 1].uri );
    }
  },
  
  didRender() {
    // Enable the environment dropdown functionality
    $('.ui.dropdown').dropdown();
    this.selectDefaultImageId();
    $('.ui.icon.selection.dropdown.license').dropdown();
    this.selectDefaultLicense();
  },
  
  selectDefaultImageId() {
    // Select the current imageId by default
    const selectedImageId = this.get('model').get('tale').get('imageId');
    $('.ui.dropdown').dropdown('set selected', selectedImageId);
  },

  selectDefaultLicense() {
    // Select the license that the Tale currently has
    const selectedLicense = this.get('model').get('tale').get('licenseSPDX');
    this.get('licenses').forEach((license) => {
      if (license.spdx == selectedLicense) {
        $('.ui.icon.selection.dropdown.license').dropdown('set selected', license.spdx);
      }
    })
  },
  
  canEditTale: computed('model.tale._accessLevel', function () {
    return this.get('model') && this.get('model').get('tale') && this.get('model').get('tale').get('_accessLevel') >= taleStatus.WRITE;
  }).readOnly(),
  cannotEditTale: computed.not('canEditTale').readOnly(),
  
  actions: {
    updateTale() {
      const tale = this.get('model').get('tale');
      const onFail = (e) => {
        alert('Error saving tale (' + tale['id'] + '):', e);
      };
      
      tale.save().catch(onFail);
    },
      
    setTaleEnvironment: function(selected) {
      const tale = this.get('model').get('tale');
      tale.set('imageId', selected);
    },

    setTaleLicense: function(selected) {
      const tale = this.get('model').get('tale');
      tale.set('licenseSPDX', selected);
    },
  }
});
