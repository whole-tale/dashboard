import { A } from '@ember/array';
import { cancel } from '@ember/runloop';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import Object, { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { scheduleOnce } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  apiCall: service('api-call'),
  // Used to listen for events (like selecting an environment)
  wtEvents: service(),
  // Used to query girder
  store: service(),
  // Used to redirect the user to the run page on success
  router: service(),
  // Holds an array of Objects which are shown in the `Input data section`
  inputData: A(),
  // Represents the environment that the user picked
  selectedEnvironment: Object.create({}),
  // The name of the Tale which appears in the UI
  newTaleName: '',
  // The message that the user sees when creating a new tale
  message: '',
  // Flag representing the state of the UI (are we currently launching an instance?)
  launchingInstance: false,
  // The title of the dataset which came from a third party
  datasetTitle: '',
  // The name of the environment that the third party picked
  environment: '',
  // The level of progress that is shown in the progress bar
  progress: 0,
  // Flag set when we're ingesting a resource from a third party
  importing: false,
  // The error message that the user will see if there is an error
  errorMessage: '',
  // The error message that gets shown on catastrophic failures
  defaultErrorMessage: "There was an error while creating your Tale.",
  // The color of the progress bar
  barColor:"#11d850",

  invalidNewTale: computed('inputData', 'selectedEnvironment', 'newTaleName', 'inputData.length', function () {
    let name = this.get('newTaleName');
    let hasName = Boolean(name && name.trim().length);
    let hasEnvironment = Boolean(this.get('selectedEnvironment') && this.get('selectedEnvironment').id);
    if (!this.get('inputData')) {
      this.set('inputData', A());
    }
    return !(hasName && hasEnvironment);
  }),

  init() {
    this._super(...arguments);
    let events = this.get('wtEvents').events;
    const self = this;
    if (self.isDestroyed) {
      return;
    }
    events.on('select', function (allSelected) {
      allSelected = self.insertPackageName(allSelected);
      self.set('inputData', allSelected);
    });
    events.on('selectEnvironment', function (selectedEnvironment) {
      self.set('selectedEnvironment', selectedEnvironment);
    });

    this.setDefaults();
    // Check if we're ingesting a dataset/tale
    if (this.get('model').queryParams.data_location) {
      this.set('importing', true);
      this.setThirdPartyParams();
      this.renderImportInfo();
    }
  },

  setDefaults() {
    // Set default values of mutable variables
    this.set('progress', 0);
    this.set('launchingInstance', false);
    this.set('message', 'Launching new Tale, please wait.');
    this.set('errorMessage', '');
    this.set('datasetTitle', '');
  },

  renderImportInfo() {
      /* 
        Schedules the function that fills in the Tale name to run afterRender
      */
    
    scheduleOnce('afterRender', this, () => {
      // Fill in the dataset title in the Tale Name and Input data fields
      this.renderExternalPackage();
      });
  },

  setThirdPartyParams() {
    // If the user is coming to this page from a third party with the intent
    // on importing data, the referrer is set here.
    this.set('datasetLocation', this.get('model').queryParams.data_location);
    this.set('datasetTitle', this.get('model').queryParams.data_title);
    this.set('packageAPI', this.get('model').queryParams.data_api);
    this.set('environment', this.get('model').queryParams.environment);
  },

  insertPackageName(allSelected) {
      /* 
        We'll want to check if we need to fake the pending dataset in the
        Input data section. This check needs to be made when we replace the 
        inputData array with newly (de)selected files.

        Inserting the package name should be done when the user is importing a dataset 
        to make it clear that their data will be inside the Tale, even though it hasn't 
        been registered yet.
      */
       let self = this;
       let datasetName = self.get('datasetTitle');
       if (datasetName) {
           // Check if it's in the file listing already
           var exists =false;
           allSelected.forEach(function (listing) {
             if (listing.name === datasetName) {
                 exists = true;
             }
         });
 
         if (exists === false) {
             let newDataObj = {
                 name: datasetName
             };
             allSelected.push(newDataObj);
           }
       }
       return allSelected;
  },

  renderExternalPackage() {
        /*
        Fills in the Tale Name and Input data section with the title of the dataset.
        */
        let self = this;
        self.set('newTaleName', self.get('datasetTitle'));
        
        // Fill in the Input data field. The UI displays 'name' in the UI in the
        // Input data section
        let newDataObj = {
            name: self.get('datasetTitle')
        };
        // self.inputData needs to be taken as an array
        let inputData = A();
        inputData.push(newDataObj)
        self.set('inputData', inputData);
  },

  // DEVNOTE: Are these used anymore?
  tale_creating: false,
  tale_created: false,
  configuration: JSON.stringify({}),

  clearForm() {
    this.set('selectedEnvironment', null);
    this.set('inputData', A());
    this.set('tale_creating', false);
    this.set('tale_created', false);
    this.set('launchingInstance', false);
    this.set('configuration', JSON.stringify({}));
  },

  launchTale(tale) {
    let component = this;
    let onSuccess = function (item) {
      const instance = Object.create(JSON.parse(item));
      const instanceId = instance._id;
      let instanceQueryLoop = null;
      // Poll the status of the instance every second using recursive iteration
      let startLooping = function (func) {
        return later(function () {
          instanceQueryLoop = startLooping(func);
          component.get('store').findRecord('instance', instance.get('_id'), { reload: true })
            .then(model => {
              if (model.get('status') === 1) {
                component.set('launchingInstance', false);
                component.get('taleLaunched')();
                cancel(instanceQueryLoop);

                component.get('router').transitionTo('run.view', instanceId);
              }
            });
        }, 1000);
      };
      //Start polling
      instanceQueryLoop = startLooping();
    };

    let onFail = function (item) {
      // deal with the failure here
      item = JSON.parse(item);
      component.set('errorMessage', item.message);
      component.send('openErrorModal');
    };

    // Attempt to create the instance
    component.get("apiCall").postInstance(
      tale.get("_id"),
      tale.get("imageId"),
      null,
      onSuccess,
      onFail);
  },

  trackTaleImport(job) {
      /* Updates the UI about the status of a tale/dataset that is being
      ingested & turned into a Tale.
      */
    let component = this;
    let jobUpdateLoop = null;
    let jobId = job._id;

    // Poll the status of the job every second using recursive iteration
    let startLooping = function (func) {
      return run.later(function () {
        jobUpdateLoop = startLooping(func);

        component.get('store').findRecord('job', jobId, { reload: true })
          .then(job => {
            let statusCode = job.get('status');
            if (statusCode === 3) {
                // The job completed
                component.set('launchingInstance', false);
                component.get('taleLaunched')();

                // Stop querying the job endpoint
                run.cancel(jobUpdateLoop);

                /* Get the ID of the instance by getting the job status and then
                transition to the run page, using the ID. */
                component.get('apiCall').getFinalJobStatus(jobId,
                    function(res) {
                        component.get('router').transitionTo('run.view', res.instance._id);
                    },
                    function() {
                        component.set('errorMessage', self.get('defaultErrorMessage'));
                    }
                );   
            }
            else if (statusCode === 2 || statusCode === 1) {
              // The job is running or queued
              if (job.progress) {
                  // Update the component variables related to progress
                  component.set('progress', job.progress.current/job.progress.total);
                  component.set('message', job.progress.message);
              }
            }
            else {
              // The job was canceled or resulted in an error
              component.get('apiCall').getFinalJobStatus(jobId,
                function(res) {
                  component.set('errorMessage', res);
                  component.send('openErrorModal');
                },
              function() {
                  component.set('errorMessage', self.get('defaultErrorMessage'));
                });

              // Stop querying the job endpoint
              run.cancel(jobUpdateLoop);  
            }
            });
      }, 1000);
    };
    //Start polling
    jobUpdateLoop = startLooping();
},

createTaleFromDataset() {
    /* Handles initiating the job to start the dataset import */
    let component = this;    
    let onFail = (e) => {
        // deal with the failure here
        component.set('errorMessage', e);
        component.send('openErrorModal');
      };
    
    // If the call succeeds, we'll get a job that we want to keep around
    let onSuccess = (job) => component.trackTaleImport(job);

    // Attempt to create a tale from a dataset
    let taleKwargs = new Object();
    taleKwargs.title = this.get('newTaleName').trim()
    component.get('apiCall').taleFromDataset(
        this.get('selectedEnvironment').get('_id'),
        this.get('datasetLocation'),
        true,
        null,
        JSON.stringify(taleKwargs),
        onSuccess,
        onFail
    );
  },

  actions: {

    // this is called when someone selected the front end image/environment
    selectEnvironment(model) {
      this.set("selectedEnvironment", model);
    },

    createTale() {
      // Handles the user's click on Create New Tale
      let component = this;
      if (component.launchingInstance) {
        return;
      }

      component.set('launchingInstance', true);

      if(component.get('importing')) {
          // If we're importing a tale/dataset, route the behavior to the importing code
          component.createTaleFromDataset();
          return;
      }
      let onSuccess = (item) => component.launchTale(item);

      let onFail = (e) => {
        // deal with the failure here
        component.set('errorMessage', e)
        component.send('openErrorModal');
      };

      let data = this.get('inputData') || {};
      let formattedData = [];
      data.forEach(x => {
        // Check that the object is a folder/item
        if (x.hasOwnProperty('id')) {
            formattedData.push({
            'type': x.get('isFolder') ? 'folder' : 'item',
            'id': x.get('id')
            });
        }
      });

      let name = this.get('newTaleName').trim();
      let new_tale = this.get('store').createRecord('tale', {
        "config": {}, //TODO: Implement configuration editor
        "involatileData": formattedData,
        "imageId": this.get('selectedEnvironment').get('_id'),
        "title": name
      });

      new_tale.save().then(onSuccess).catch(onFail);
    },

    openErrorModal() {
        let selector = '.ui.compose-error.modal';
        $(selector).modal('setting', 'closable', false);
        $(selector).modal('show');
      },
    
      closeErrorModal() {
        this.setDefaults();
        return false;
      },
  },
});
