import Component from '@ember/component';
import Object, { computed } from '@ember/object';
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
  publishedURL: 'This Tale has not been published',
  // Array of author dicts that the template uses to render rows
  taleAuthors: A(),
  // An error message that can get set, displayed in the error modal
  errorMessage: String(),
  model: null,
  cannotEditTale: computed.not('canEditTale').readOnly(),
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

  didInsertElement() {
    this._super(...arguments);

    // Re-render the rows by discarding the previous state and
    // re-adding the authors
    this.taleAuthors.clear();
    this.addTaleAuthors();
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
      
   /* 
    Generates a uui that can assigned to a tale author. Note that this change 
    allows identification about which author row is being interacted with. This
    change does not persist to the backend.
   */
  ID() {
    let array = new Uint32Array(8)
    window.crypto.getRandomValues(array)
    let str = ''
    for (let i = 0; i < array.length; i++) {
      str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
    }
    return str
  },

  /* 
    Adds the Tale's saved authors to the component property
    that the handlebars template uses to create rows (this.taleAuthors)
  */
 addTaleAuthors() {
  let authors = this.get('model').get('tale').authors;
  
  for (let i = 0; i < authors.length; i++) {
    let newAuthor = {
      'id': this.ID(),
      'firstName': authors[i].firstName,
      'lastName': authors[i].lastName,
      'orcid': authors[i].orcid
  }
    this.taleAuthors.pushObject(newAuthor);
  }
},

  /* 
    Iterates over the array of saved&unsaved authors and makes sure that
      1. There is at least one author
      2. All of the authors have a first & last name and and an ORCID
  */
  validateAuthors () {
    if (this.taleAuthors.length < 1) {
      this.set('errorMessage', 'Your Tale must have at least one author; please add one to the Tale.');
      return false
    }
    let res = true;
    this.taleAuthors.forEach((author) => {
      if (author.lastName.length < 1) {
        this.set('errorMessage', "There is a Tale author that's missing a last name.");
        res = false
      }
      if (author.firstName.length < 1 ) {
        this.set('errorMessage', "There is a Tale author that's missing a first name.");
        res = false;
      }
      if (author.orcid.length < 1) {
        this.set('errorMessage', "There is a Tale author that's missing an ORCID.");
        res = false;
      }
    });
    return res;
  },
  
  /* 
    There is a discrepency between the Tale 'authors' object and the ones used in the
    component. The ID field needs to be removed before adding the structure to the model.
    This method formats the component object and updates the Tale model with it.
  */
  addAuthorsTaleModel() {
    let taleAuthors = []
    this.taleAuthors.forEach((author) => {
      taleAuthors.push(
        {
          'firstName': author.firstName,
          'lastName': author.lastName,
          'orcid': author.orcid
        })
      })
    this.model.tale.set('authors', taleAuthors);
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
        // Preform any author formatting
        this.addAuthorsTaleModel()
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
    
    /* 
    Adds a new, blank user to the component authors object, which
    then gets added as a new row in the UI.
    */
    addNewAuthor() {
      let newAuthor = {
        'id': this.ID(),
        'firstName': '',
        'lastName': '',
        'orcid':'',
      }
      this.taleAuthors.pushObject(newAuthor)
    },

    /* 
    Removes an author from the component, and is consequentially removed
    in the UI.
    */
    removeAuthor(id) {
      let currentAuthors = this.get('taleAuthors');
      let deletedAuthor = currentAuthors.find(o => o.id === id);
      if(deletedAuthor){
        let authorLocation = currentAuthors.indexOf(deletedAuthor);
        if (authorLocation > -1) {
          this.taleAuthors.removeAt(authorLocation);
        }
      }
    },

    /* 
      Open the modal that the user sees when an error occurred or when validation failed.
    */
    openErrorModal() {
      let selector = '.ui.metadata-error.modal';
      $(selector).modal('setting', 'closable', true);
      $(selector).modal('show');
    },
    
    closeErrorModal() {
      return false;
    },
  }
});
