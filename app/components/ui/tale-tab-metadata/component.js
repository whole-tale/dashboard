import Component from '@ember/component';
import { computed } from '@ember/object';
import { A } from '@ember/array';
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
  // Array of author dicts that the template uses to render rows
  taleAuthors: A(),
  // An error message that can get set, displayed in the error modal
  errorMessage: String(),
  model: null,
  // Flag that can be used to tell if the current user has permission to edit the Tale
  canEditTale: computed('model.tale._accessLevel', function () {
    return this.get('model') && this.get('model').get('tale') && this.get('model').get('tale').get('_accessLevel') >= taleStatus.WRITE;
  }).readOnly(),
  cannotEditTale: computed.not('canEditTale').readOnly(),
  
  publishedURL: computed('model.tale', 'model.tale.publishInfo', function() {
    const tale = this.get('model').get('tale');
    if (tale.publishInfo && tale.publishInfo.length) {
       return tale.publishInfo[tale.publishInfo.length - 1].uri;
    }
    return null;
  }),

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

    this.refreshAuthors();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.refreshAuthors();
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

  /**
   * Resets the authors section
   * @method refreshAuthors
   */
  refreshAuthors() {
    this.taleAuthors.clear();
    this.addTaleAuthors();
  },

  /** 
   * Adds the Tale's saved authors to the component property
   * that the handlebars template uses to create rows (this.taleAuthors)
   * @method addTaleAuthors
  */
 addTaleAuthors() {
  let authors = this.get('model').get('tale').authors;
  this.taleAuthors.pushObjects(authors);
 },

  /**
   * Iterates over the array of saved&unsaved authors and makes sure that
   *   1. There is at least one author
   *   2. All of the authors have a first & last name and and an ORCID
   * @method validateAuthors
  */
  validateAuthors () {
    if (this.taleAuthors.length < 1) {
      this.set('errorMessage', 'Your Tale must have at least one author; please add one to the Tale.');
      return false
    }

    for (let i=0; i<this.taleAuthors.length; i++) {
      let author =  this.taleAuthors[i];
      if (author.lastName.length < 1) {
        this.set('errorMessage', "There is a Tale author that's missing a last name.");
        return false;
      }
      if (author.firstName.length < 1 ) {
        this.set('errorMessage', "There is a Tale author that's missing a first name.");
        return false;
      }
      if (author.orcid.length < 1) {
        this.set('errorMessage', "There is a Tale author that's missing an ORCID.");
        return false;
      }
    };
    return true;
  },

  actions: {

    /* 
      Takes the fields in the UI and updates the Tale model with the new
      values.
    */
    updateTale() {
      const tale = this.get('model').get('tale');
      const onFail = (e) => {
        this.set('errorMessage', ('Error saving tale (' + tale['id'] + '):', e));
        this.send('openErrorModal');
      };

      // Only update the Tale if the authors are valid
      if (this.validateAuthors()) {
        this.model.tale.set('authors', this.taleAuthors);
        // Request that the Tale model be updated
        tale.save().catch(onFail);
      }
      else {
        this.send('openErrorModal');
      }
    },

    setTaleEnvironment: function(selected) {
      const tale = this.get('model').get('tale');
      tale.set('imageId', selected);
    },

    setTaleLicense: function(selected) {
      const tale = this.get('model').get('tale');
      tale.set('licenseSPDX', selected);
    },
    
    /**
     * Adds a new, blank user to the component authors object, which
     * then gets added as a new row in the UI.
     * @method addNewAuthor
    */
    addNewAuthor() {
      if (this.canEditTale) {
        let newAuthor = {
          'firstName': '',
          'lastName': '',
          'orcid':'',
        }
        this.taleAuthors.pushObject(newAuthor)
      }
    },

    /**
     * Removes an author from the component, and is consequentially removed
     * in the UI.
     * @method removeAuthor
    */
    removeAuthor(id) {
      if (this.canEditTale) {
        this.taleAuthors.removeAt(id);
      }
    },

    /**
     * Open the modal that the user sees when an error occurred or when validation failed.
     * @method openErrorModal
    */
    openErrorModal() {
      let selector = '.ui.metadata-error.modal';
      $(selector).modal('setting', 'closable', true);
      $(selector).modal('show');
    },
  }
});
