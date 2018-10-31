import Component from '@ember/component';
import Object, { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  apiCall: service('api-call'),
  wtEvents: service(),
  store: service(),
  router: service(),

  // Holds an array of Objects which are shown in the `Input data section`
  inputData: A(),
  selectedEnvironment: Object.create({}),
  // The name of the Tale which appears in the UI
  newTaleName: '',
  message: 'Launching new Tale, please wait.',
  launchingInstance: false,
  datasetSource: null,
  // The title of the dataset which came from a third party
  datasetTitle: '',

  invalidNewTale: computed('inputData', 'selectedEnvironment', 'newTaleName', 'inputData.length', function () {
    let name = this.get('newTaleName');
    let hasName = Boolean(name && name.trim().length);
    let hasEnvironment = Boolean(this.get('selectedEnvironment') && this.get('selectedEnvironment').id);
    if (!this.get('inputData')) {
      this.set('inputData', A());
    }
    // let hasData = Boolean(this.get('inputData') && this.get('inputData').length);
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

    // If the user is coming to this page from a third party with the intent
    // on importing data, the referrer is set here.
    self.set('datasetLocation', this.get('model').queryParams.data_location);
    self.set('datasetProvider', this.get('model').queryParams.data_provider);
    self.set('packageAPI', this.get('model').queryParams.data_api);
    scheduleOnce('afterRender', this, () => {
        // Check if we're coming from a third party
        if (this.get('datasetLocation')) {
            let provider = this.get('datasetProvider');
            // Check to see where we're coming from
            if (provider === 'dataone') {
                this.renderDataONEPackage();
            }
            else if (provider === 'dataverse') {
                this.renderDataversePackage();
            }
            else {
                return;
            }
        }
        else {
            return;
        }
      });
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
       let datasetName = self.get('packageAPI');
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

  renderDataONEPackage() {
    console.log('Rendering DataONE package');
  },

  renderDataversePackage() {
        /*
        Queries the dataverse endpoint for information about a package and fills in
        the proper component variables.
        */
        let self = this;
        let url =this.get('packageAPI')+'/datasets/:persistentId?persistentId='+this.get('datasetLocation');
        jQuery.get(url, function(resp){
            self.set('datasetTitle', resp.data.latestVersion.metadataBlocks.citation.fields[0].value);
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
         });
  },

  // public_checked : false,
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

      let currentLoop = null;
      // Poll the status of the instance every second using recursive iteration
      let startLooping = function (func) {
        return run.later(function () {
          currentLoop = startLooping(func);
          component.get('store').findRecord('instance', instance.get('_id'), { reload: true })
            .then(model => {
              if (model.get('status') === 1) {
                component.set('launchingInstance', false);
                component.get('taleLaunched')();
                run.cancel(currentLoop);

                component.get('router').transitionTo('run.view', instanceId);
              }
            });
        }, 1000);
      };
      //Start polling
      currentLoop = startLooping();
    };

    let onFail = function (item) {
      // deal with the failure here
      item = JSON.parse(item);
      component.set('launchingInstance', false);
    };

    // submit: API
    // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

    component.get("apiCall").postInstance(
      tale.get("_id"),
      tale.get("imageId"),
      null,
      onSuccess,
      onFail);
  },

  actions: {
    // this is called when someone selected the front end image/environment
    selectEnvironment(model) {
      this.set("selectedEnvironment", model);
    },

    //   Launch new Tale functionality
    createTale() {
      let component = this;

      if (component.launchingInstance) {
        return;
      }

      component.set('launchingInstance', true);

      let onSuccess = (item) => component.launchTale(item);

      let onFail = () => {
        // deal with the failure here
        component.set('launchingInstance', false);
      };

      let data = this.get('inputData') || {};
      let formattedData = [];
      data.forEach(x => {
        formattedData.push({
          'type': x.get('isFolder') ? 'folder' : 'item',
          'id': x.get('id')
        });
      });

      let name = this.get('newTaleName').trim();
      let new_tale = this.get('store').createRecord('tale', {
        "config": {}, //TODO: Implement configuration editor
        "involatileData": formattedData,
        "imageId": this.get('selectedEnvironment').get('_id'),
        "title": name
      });

      new_tale.save().then(onSuccess).catch(onFail);
    }
  }
});
