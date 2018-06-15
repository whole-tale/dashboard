import Ember from 'ember';
import {computed} from '@ember/object';

export default Ember.Component.extend({
  apiCall : Ember.inject.service('api-call'),
  // invalidNewTale: true,
  wtEvents: Ember.inject.service(),

  inputData: Ember.A(),
  selectedEnvironment: Ember.Object.create({}),
  newTaleName: '',

  invalidNewTale: computed('inputData', 'selectedEnvironment', 'newTaleName', 'inputData.length', function() {
    let hasName = Boolean(this.get('newTaleName') && this.get('newTaleName').length);
    let hasEnvironment = Boolean(this.get('selectedEnvironment') && this.get('selectedEnvironment').id);
    let hasData = Boolean(this.get('inputData') && this.get('inputData').length);
    return !(hasName && hasEnvironment && hasData);
  }),

  init() {
    this._super(...arguments);
    let events = this.get('wtEvents').events;
    const self = this;
    events.on('select', function(allSelected) {
      self.set('inputData', allSelected);
    });
    events.on('selectEnvironment', function(selectedEnvironment) {
      self.set('selectedEnvironment', selectedEnvironment);
    });
  },

  // just checking the toggle works ...
  publicCheckedObserver: Ember.observer('public_checked', function() {
    console.log("Checked = " + this.get('public_checked'));
  }),

  publicDescriptionObserver: Ember.observer('description', function() {
    console.log("Description = " + this.get('description'));
  }),

  // public_checked : false,
  frontend : null,
  folder : null,
  tale_creating: false,
  tale_created: false,
  configuration : JSON.stringify({}),

  clearForm() {
    this.set('frontend', null);
    this.set('folder', null);
    this.set('tale_creating', false);
    this.set('tale_created', false);
    this.set('configuration', JSON.stringify({}));
  },

  // clearWizard() {
  //   this.set('public_checked', false);
  //   this.set('frontend', null);
  //   this.set('folder', null);
  //   this.set('tale_creating', false);
  //   this.set('tale_created', false);
  //   this.set('configuration', JSON.stringify({}));
  // },

  actions: {
    // this is called when someone selected the front end image/environment
    selectEnvironment: function (model) {
      console.log(model.get('name') + " frontend image has been selected in compose.js...");
      this.set("frontend", model);
    },

    selectedFolder: function(model) {
      console.log(model.get('name'));
      this.set('folder', model);
    },

    //   Launch new Tale functionality

    //     let component = this;

    //     component.set("tale_creating", true);

    //     var onSuccess = function(item) {
    //       component.set("tale_creating", false);
    //       component.set("tale_created", true);

    //       Ember.run.later((function() {
    //         component.set("tale_created", false);
    //         // component.clearWizard();
    //         component.clearForm();
    //         component.transitionToRoute('tale.view', item);
    //       }), 3000);
    //     };

    //     let onFail = function(e) {
    //       // deal with the failure here
    //       component.set("tale_creating", false);
    //       component.set("tale_not_created", true);
    //       console.log(e);

    //       Ember.run.later((function() {
    //         component.set("tale_not_created", false);
    //       }), 3000);

    //     };

    //     let new_tale = this.get('store').createRecord('tale', {
    //       "config": {},   //TODO: Implement configuration editor
    //       "description": this.get('description'),
    //       "folderId":    this.get('folder').get('_id'),
    //       "imageId":     this.get('frontend').get('_id'),
    //       "public":      this.get('public_checked'),
    //       "title":       this.get('title'),
    //     });

    //     new_tale.save().then(onSuccess).catch(onFail);
    //   },

  }

});
