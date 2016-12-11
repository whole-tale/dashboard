import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Controller.extend({
  collectionName : "Ians Test Collection",
  collectionID : "5811990986ed1d00011ad6d7",
  actions: {
    upload : function() {
      alert("Upload to Girder!");
    }
  }
});
