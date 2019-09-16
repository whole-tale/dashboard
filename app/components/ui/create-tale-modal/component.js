import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  apiCall: service('api-call'),
  store: service(),
  router: service(),
  title: "",
  imageId: "",
  dataSet: null,
  config: null,
  createAndLaunch: true,
  createButtonText: computed('createAndLaunch', function() {
    return this.get('createAndLaunch') ? 'Create New Tale and Launch' : 'Create New Tale';
  }),

  disabled: computed('title', 'imageId', function() {
    return (this.get('title') && this.get('imageId')) ? '' : 'disabled';
  }),
  
  defaultErrorMessage: "There was an error while creating your Tale.",

  // ---------------------------------------------------------------------------------
  // ACTIONS TOC:
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
      let {dataSet, config, title, imageId, datasetAPI} = this;

      title = title.trim();

      if (this.importing) {
        this.importTaleFromDataset(title, imageId, dataSet||[], datasetAPI)
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
          let {api, name, uri, environment} = this.queryParams;

          this.set('dataSet', uri);
          this.set('title', name || uri);

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
        this.handleError({responseJSON:{message:e+""}});
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
    newTale.save().then(item => {
      this.newTale = item;
      self.sendAction('_refresh', item);

      let taleId = item.id;
      self.closeModal();

      if (self.createAndLaunch) {
        this.get('apiCall').startTale(this.newTale).then((instance) => {
          newTale.set('instance', instance)
          later(() => { self.router.transitionTo('run.view', taleId); }, 500);
        })
        .catch(e => {
          self.handleLaunchError(e);
        });
      } else {
        later(() => { self.router.transitionTo('run.view', taleId); }, 500);
      }
    }).catch(e => {
      self.handleError(e);
    });
  }, 

  // ---------------------------------------------------------------------------------
  // Calls POST /tale/import
  // Does nothing with the job that is returned (see comment below)
  // ---------------------------------------------------------------------------------
  importTaleFromDataset(title, imageId, url, datasetAPI) {
    let taleKwargs = {title};

    let lookupKwargs = {};
    if (datasetAPI) {
      lookupKwargs.base_url = datasetAPI;
    }

    let appendPath = 'import';
    let newTaleImport = this.get('store').createRecord('tale');

    let queryParams = {taleKwargs:JSON.stringify(taleKwargs), lookupKwargs:JSON.stringify(lookupKwargs), imageId, url, spawn:this.createAndLaunch};
    let adapterOptions = {appendPath, queryParams};
    
    const self = this;
    newTaleImport.save({adapterOptions}).then((tale) => {
      self.closeModal();
      later(() => { self.router.transitionTo('run.view', tale._id) }, 500);
    }).catch(e => {
      self.handleError({responseJSON:{message:e+""}});
    });
    
    this.router.transitionTo({queryParams: {environment: null, name: null, uri: null, api: null}});
  }
});
