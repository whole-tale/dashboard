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
  model: null,
  init() {
    this._super(...arguments);
    
    // Fetch images for user to select an environment
    let component = this;
    $.getJSON(this.get('apiHost') + '/api/v1/image/').then(function(images) {
      component.set('environments', images);
      component.selectDefaultImageId();
    });
  },
  
  didRender() {
    // Enable the environment dropdown functionality
    $('.ui.dropdown').dropdown();
    this.selectDefaultImageId();
  },
  
  selectDefaultImageId() {
    // Select the current imageId by default
    let selectedImageId = this.get("model").get("tale").get("imageId")
    $('.ui.dropdown').dropdown('set selected', selectedImageId);
  },
  
  canEditTale: computed('model.tale._accessLevel', function () {
    return this.get('model') && this.get('model').get('tale') && this.get('model').get('tale').get('_accessLevel') >= taleStatus.WRITE;
  }).readOnly(),
  cannotEditTale: computed.not('canEditTale').readOnly(),
  
  actions: {
    updateTale() {
      let tale = this.get("model").get("tale");
      let onSuccess = (item) => {
        //console.log("Successfully saved tale (" + tale['id'] + "):", tale);
      };
      
      let onFail = (e) => {
        alert("Error saving tale (" + tale['id'] + "):", tale);
      };
      
      tale.save().then(onSuccess).catch(onFail);
    },
      
    setTaleEnvironment: function(selected) {
      let tale = this.get('model').get("tale");
      tale.set('imageId', selected);
    },
  }
});