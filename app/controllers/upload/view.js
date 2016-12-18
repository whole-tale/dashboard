import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  init() {
  },

  actions: {
    download: function(itemID, itemName, ) {
    },
    updateDetails: function (item) {
      console.log("Updating the File details!!");


      var onSuccess = function(item) {
        self.transitionToRoute('upload.view', item);
      };

      var onFail = function(item) {
        // deal with the failure here
        alert(item);
        console.log(item);
      };


      item.save().then(onSuccess, onFail);
    }

  }

});
