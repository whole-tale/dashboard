import Ember from 'ember';
import {
  computed
} from '@ember/object';

export default Ember.Component.extend({
  apiCall: Ember.inject.service('api-call'),
  wtEvents: Ember.inject.service(),
  store: Ember.inject.service(),
  router: Ember.inject.service(),

  inputData: Ember.A(),
  selectedEnvironment: Ember.Object.create({}),
  newTaleName: '',

  invalidNewTale: computed('inputData', 'selectedEnvironment', 'newTaleName', 'inputData.length', function () {
    let hasName = Boolean(this.get('newTaleName') && this.get('newTaleName').length);
    let hasEnvironment = Boolean(this.get('selectedEnvironment') && this.get('selectedEnvironment').id);
    let hasData = Boolean(this.get('inputData') && this.get('inputData').length);
    return !(hasName && hasEnvironment && hasData);
  }),

  init() {
    this._super(...arguments);
    let events = this.get('wtEvents').events;
    const self = this;
    events.on('select', function (allSelected) {
      self.set('inputData', allSelected);
    });
    events.on('selectEnvironment', function (selectedEnvironment) {
      self.set('selectedEnvironment', selectedEnvironment);
    });
  },

  // just checking the toggle works ...
  publicCheckedObserver: Ember.observer('public_checked', function () {
    console.log("Checked = " + this.get('public_checked'));
  }),

  publicDescriptionObserver: Ember.observer('description', function () {
    console.log("Description = " + this.get('description'));
  }),

  // public_checked : false,
  frontend: null,
  folder: null,
  tale_creating: false,
  tale_created: false,
  configuration: JSON.stringify({}),

  clearForm() {
    this.set('selectedEnvironment', null);
    this.set('folder', null);
    this.set('tale_creating', false);
    this.set('tale_created', false);
    this.set('configuration', JSON.stringify({}));
  },

  launchTale: function (tale) {
    let component = this;

    let onSuccess = function (item) {
      // const instance = Ember.Object.create(JSON.parse(item));
      console.log('Launching new instance');
      Ember.run.later((function () {
        component.get('router').transitionTo('run');
      }), 1000);
    };

    let onFail = function (item) {
      // deal with the failure here
      item = JSON.parse(item);
      console.log(item);
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
      console.log(model.get('name') + " frontend image has been selected in compose.js...");
      this.set("selectedEnvironment", model);
    },

    selectedFolder(model) {
      console.log(model.get('name'));
      this.set('folder', model);
    },

    //   Launch new Tale functionality
    createTale() {
      console.log('Attempting to launch tale!');
      let component = this;

      let onSuccess = function (item) {
        component.launchTale(item);
      };

      let onFail = function (e) {
        // deal with the failure here
        console.log(e);
      };

      let data = this.get('inputData') || {};
      let formattedData = [];
      data.forEach(x => {
        formattedData.push({
          'type': x.get('isFolder') ? 'folder' : 'item',
          'id': x.get('id')
        });
      });

      let new_tale = this.get('store').createRecord('tale', {
        "config": {}, //TODO: Implement configuration editor
        "involatileData": formattedData,
        "imageId": this.get('selectedEnvironment').get('_id'),
        "title": this.get('newTaleName')
      });

      new_tale.save().then(onSuccess).catch(onFail);
    }
  }
});
