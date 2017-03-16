import Ember from 'ember';
import EmberUploader from 'ember-uploader';
var inject = Ember.inject;

export default Ember.Controller.extend({
  init() {
  },

actions: {
    // updateDetails: function () {
    //   var component = this;
    //   component.set("details_updating", false);
    //
    //   console.log("Updating the File details!!");
    //   var item = this.get('model');
    //   console.log(item.changedAttributes());
    //
    //   var description = this.get('model').get('description');
    //   var name = this.get('model').get('name');
    //   var onSuccess = function(item) {
    //     component.set("details_updated", true);
    //
    //     Ember.run.later((function() {
    //       component.set("details_updated", false);
    //       component.transitionToRoute('image.view', item);
    //     }), 1000);
    //   };
    //
    //   var onFail = function(item) {
    //     // deal with the failure here
    //     component.set("details_not_updated", true);
    //     console.log(item);
    //
    //     Ember.run.later((function() {
    //       component.set("details_not_updated", false);
    //     }), 5000);
    //
    //   };
    //
    //
    //   this.get("apiCall").putItemDetails(item.get('_id'), name, description, onSuccess, onFail);
    //
    // },
    textUpdated : function (text) {
      // do something with

      console.log(this.get('model').get('description'));
    },
    back : function () {
      history.back();
    }
  },


});
