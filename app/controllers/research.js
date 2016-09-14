import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
  },
  progressOne :10,
  actions: {
    setdockerfile : function(dockerfilename) {
      this.set('dockerfile', dockerfilename);
      this.set('progressOne', this.get('progressOne') +30);
    },
    setfrontend : function(frontend) {
      this.set('frontend', frontend);
      this.set('progressOne', this.get('progressOne') +30);
    },
    setdrive : function(drive) {
      this.set('drive', drive);
      this.set('progressOne', this.get('progressOne') +30);
    },
    authoradd : function() {
      alert("Add author!");
    },

    details: function(name) {
      this.set('researchdetails', true);
    },

    updatedetails: function(name) {
      this.set('researchdetails', false);
    },

  }
});
