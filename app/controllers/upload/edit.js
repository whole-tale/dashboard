import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({

  updatedText : "",
  actions: {
    download: function(itemID, itemName, ) {
    },
    textUpdated : function (newText) {
      // records updates
      this.set("updatedText", newText);
    },
    updateTextFile : function () {
      console.log("Updating the file!!");

    }

  }
});
