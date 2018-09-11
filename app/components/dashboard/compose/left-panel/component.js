import Component from '@ember/component';
import Object, { computed, observer } from '@ember/object';
import { inject as service } from '@mber/service';
import { A } from '@ember/array';
import { run } from '@ember/runloop';

export default Component.extend({
  apiCall: service('api-call'),
  wtEvents: service(),
  store: service(),
  router: service(),

  inputData: A(),
  selectedEnvironment: Object.create({}),
  newTaleName: '',
  message: 'Launching new Tale, please wait.',
  launchingInstance: false,

  invalidNewTale: computed('inputData', 'selectedEnvironment', 'newTaleName', 'inputData.length', function () {
    let name = this.get('newTaleName');
    let hasName = Boolean(name && name.trim().length);
    let hasEnvironment = Boolean(this.get('selectedEnvironment') && this.get('selectedEnvironment').id);
    if(!this.get('inputData')) {
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
      self.set('inputData', allSelected);
    });
    events.on('selectEnvironment', function (selectedEnvironment) {
      self.set('selectedEnvironment', selectedEnvironment);
    });
  },

  // just checking the toggle works ...
  publicCheckedObserver: observer('public_checked', function () {
    console.log("Checked = " + this.get('public_checked'));
  }),

  publicDescriptionObserver: observer('description', function () {
    console.log("Description = " + this.get('description'));
  }),

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
      console.log(`Launching new instance with id: ${instanceId}`);

      let currentLoop = null;
      // Poll the status of the instance every second using recursive iteration
      let startLooping = function(func){
        return run.later(function(){
          currentLoop = startLooping(func);
          component.get('store').findRecord('instance', instance.get('_id'), { reload:true })
            .then(model => {
              if(model.get('status') === 1) {
                component.set('launchingInstance', false);
                component.get('taleLaunched')();
                run.cancel(currentLoop);
              }
            });
        }, 1000);
      };
      //Start polling
      currentLoop = startLooping();

      run.later((function () {
        component.get('router').transitionTo('run.view', instanceId);
      }), 1000);
    };

    let onFail = function (item) {
      // deal with the failure here
      item = JSON.parse(item);
      component.set('launchingInstance', false);
      console.log(`Launching new instance ${item} threw some errors`);
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

      if (component.launchingInstance)
      {
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
