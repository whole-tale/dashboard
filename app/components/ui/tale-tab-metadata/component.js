import Ember from 'ember';
import { later } from '@ember/runloop';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';

import $ from 'jquery';

import config from '../../../config/environment';

const taleStatus = Object.create({
  NONE: -1,
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
  SITE_ADMIN: 100
});

export default Ember.Component.extend({
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
    // TODO: Status messages are still missing
    updateTale() {
      let tale = this.get("model").get("tale");
      let component = this;
      //component.set("tale_creating", true);
      console.log("Sending updated tale:", tale);
      console.log("New image ID:", tale.imageId);
      
      let onSuccess = (item) => {
      //component.set("tale_creating", false);
      //component.set("tale_created", true);
      
      later((function () {
        //component.set("tale_created", false);
        // component.transitionToRoute('upload.view', item);
      }), 10000);
      console.log("Successfully saved tale (" + tale['id'] + "):", tale)
      };
      
      let onFail = function (e) {
      // deal with the failure here
      //component.set("tale_creating", false);
      //component.set("tale_not_created", true);
      //component.set("error_msg", e.message);
      
      later((function () {
        //component.set("tale_not_created", false);
      }), 10000);
      console.log("Error saving tale (" + tale['id'] + "):", tale)
      };
      
      tale.save().then(onSuccess).catch(onFail);
    },
      
    setTaleEnvironment: function(selected) {
      let tale = this.get('model').get("tale");
      tale.set('imageId', selected);
      console.log("Tale image changed:", tale.imageId);
    },
  }
});