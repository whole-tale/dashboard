import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  store: service(),
  router: service(),
  apiCall: service(),
  
  title: "",
  imageId: "",
  dataSet: null,
  config: null,
  asTale: false,
  asTaleEnabled: true,
  
  createAndLaunch: true,
  createButtonText: computed('createAndLaunch', function() {
    return this.get('createAndLaunch') ? 'Create New Tale and Launch' : 'Create New Tale';
  }),

  disabled: computed('title', 'imageId', function() {
    return (this.get('title') && this.get('imageId')) ? '' : 'disabled';
  }),
  
  defaultErrorMessage: "There was an error while creating your Tale.",
  
  didRender() {
    const component = this;
    $('#as-tale-false-chkbox').checkbox({
      onChecked: function() {
        console.log('Toggling asTale to false');
        component.set('asTale', false);
      }
    });
    $('#as-tale-true-chkbox').checkbox({
      onChecked: function() {
        console.log('Toggling asTale to true');
        component.set('asTale', true);
      }
    });
  },

  // ---------------------------------------------------------------------------------
  // ACTIONS TOC:
  //   toggleAsTale(newValue) = Event: onChange when clicking radio buttons during import
  //   createNewTaleButton() = Event: onClick "Create New Tale" button
  //   clearModal()          = Event: onHide modal 
  //   setModalFromQueryParams() = Event: onShow modal
  //   setDefaultAction()    = Event: onSelect "Create New Tale" dropdown
  // ---------------------------------------------------------------------------------
  actions: {
    // ---------------------------------------------------------------------------------
    // Either imports tale from a dataset or creates a new tale
    // ---------------------------------------------------------------------------------
    createNewTaleButton() {
      let {dataSet, config, title, imageId, datasetAPI, asTale} = this;

      title = title.trim();

      if (this.importing) {
        this.importTaleFromDataset(title, imageId, dataSet||[], datasetAPI, asTale);
      } else {
        this.createNewTale(title, imageId, dataSet||[], config||{});
      }
      
      return false;
    },

    // ---------------------------------------------------------------------------------
    // clears all text fields 
    // ---------------------------------------------------------------------------------
    clearModal() {
      this.set('importing', false);
      this.set('datasetAPI', null);
      this.set('imageId', null);
      this.set('dataSet', null);
      this.set('asTale', null);
      this.set('title', null);
      this.set('errorMessage', "");
      $('.ui.dropdown.compute-environment').dropdown('clear');
    },

    // ---------------------------------------------------------------------------------
    // If being referred to from a third party, then prepopulate the modal from query params
    // ---------------------------------------------------------------------------------
    setModalFromQueryParams() {
      try {
        if (this.queryParams.uri) {
          this.set('importing', true);
          let {api, name, uri, environment, asTale} = this.queryParams;

          this.set('dataSet', uri);
          this.set('title', name || uri);
          
          // asTale defaults to false; it will only be set to true if query param 
          // is present and some form of the string "True" (case insensistive)
          if (asTale && asTale.toLowerCase() === "true") {
            later(() => $('#as-tale-true-chkbox').checkbox('check'), 500);
          }

          let {official, nonOfficial} = this.computeEnvironments;
          let image = official.findBy('name', environment) || nonOfficial.findBy('name', environment);
          if (!image && environment) throw new Error('Could not find specified environment: '+environment);

          if (image) {
            this.set('imageId', image.id);
            $('.ui.dropdown.compute-environment').dropdown('set selected', image.id);
          }

          this.set('datasetAPI', api);
        }
      } catch(e) {
        this.handleError(e);
      }
    },

    // ---------------------------------------------------------------------------------
    // Sets the default action to take when clicking on "Create New Tale" button
    // Choices are: Create Tale   ,    Create Tale and Launch
    // ---------------------------------------------------------------------------------
    setDefaultAction(createAndLaunch) {
      this.set('createAndLaunch', createAndLaunch);
    },
    
    // ---------------------------------------------------------------------------------
    // Dismiss the separate modal showing the launch error
    // ---------------------------------------------------------------------------------
    dismissLaunchErrorModal() {
    },
  },

  // ---------------------------------------------------------------------------------
  // 
  // ---------------------------------------------------------------------------------
  closeModal() {
    // Clear query string parameters (to prevent it opening after next refresh)
    this.router.transitionTo({queryParams: {environment: null, name: null, uri: null, api: null, asTale: null}});
    
    // Close the modal
    $('.ui.modal.create-tale').modal('hide');
  },
  
  // ---------------------------------------------------------------------------------
  // Display error message in a separate modal
  // ---------------------------------------------------------------------------------
  handleLaunchError(e) {
    const self = this;
    self.handleError(e);
    $('.ui.modal.compose-error').modal('show');
    $('.ui.modal.compose-error').modal({
      onHide: function(element) {
        //$('.ui.modal.compose-error').modal('hide');
        later(() => { self.router.transitionTo('run.view', self.newTale._id); }, 500);
        return true;
      },
    });
  },

  // ---------------------------------------------------------------------------------
  // Display error message
  // ---------------------------------------------------------------------------------
  handleError(e) {
    let errorMessage = (e.responseJSON ? e.responseJSON.message : this.get('defaultErrorMessage'));
    this.set('errorMessage', errorMessage);
  },

  // ---------------------------------------------------------------------------------
  // Calls POST /tale
  // if launch is false: transitions to the "tale view" pane on success
  // if launch is true:  launches the tale and transitions to the "run" pane on success
  // ---------------------------------------------------------------------------------
  createNewTale(title, imageId, dataSet, config) {
    const store = this.get('store');
    dataSet = dataSet || [];
    config = config || {};
    let newTale = store.createRecord('tale', {title, imageId, dataSet, config});

    const self = this;
    newTale.save().then(tale => {
      this.newTale = tale;
      self.onTaleCreateSuccess(tale);
    }).catch(e => {
      self.handleError(e);
    });
  }, 

  // ---------------------------------------------------------------------------------
  // Calls POST /tale/import
  // Does nothing with the job that is returned (see comment below)
  // ---------------------------------------------------------------------------------
  importTaleFromDataset(title, imageId, url, datasetAPI, asTale) {
    let taleKwargs = {title};

    let lookupKwargs = {};
    if (datasetAPI) {
      lookupKwargs.base_url = datasetAPI;
    }

    let appendPath = 'import';
    let newTaleImport = this.get('store').createRecord('tale');

    // Pass-thru modal query parameters to import request
    let queryParams = {
      taleKwargs: JSON.stringify(taleKwargs),
      lookupKwargs: JSON.stringify(lookupKwargs),
      spawn:false,
      imageId,
      url,
      asTale
    };
    
    let adapterOptions = {appendPath, queryParams};
    
    const self = this;
    newTaleImport.save({adapterOptions}).then((tale) => {
      self.onTaleCreateSuccess(tale);
    }).catch(e => {
      self.handleError(e);
    });
  },
  
  onTaleCreateSuccess(tale) {
    const self = this;
    self.sendAction('_refresh', tale);
    if (self.createAndLaunch) {
      self.get('apiCall').startTale(tale).then(instance => {
        self.get('apiCall').waitForInstance(instance);
        self.gotoRun(tale);
      })
      .catch(e => {
        self.handleLaunchError(e);
      });
    } else {
      self.gotoRun(tale);
    }
    self.closeModal();
  },
  
  gotoRun(tale) {
    const self = this;
    later(() => { self.router.transitionTo('run.view', tale._id); }, 500);
  }
  
});
