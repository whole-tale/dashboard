import Ember from 'ember';
import EmberUploader from 'ember-uploader';
var inject = Ember.inject;

export default Ember.Controller.extend({
  apiCall : Ember.inject.service('api-call'),
  filePreviewURL : "",
  fileDownloadURL : "",
  internalState: inject.service(),
  fileBreadCrumbs : {},
  currentBreadCrumb : [],
  init() {
    var state = this.get('internalState');
    this.set("currentBreadCrumb", state.getCurrentBreadCrumb());
    this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs());
  },

  valueObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller observer hook is called from nested 'view'");
    var model = this.get('model');
    console.log(model);

    this.set('filePreviewURL', this.get('apiCall').getPreviewLink(model.get('._id')));
    this.set('fileDownloadURL', this.get('apiCall').getDownloadLink(model.get('._id')));
  }),

actions: {
    download: function(itemID, itemName) {
    },
    updateDetails: function () {
      var component = this;
      component.set("details_updating", false);

      console.log("Updating the File details!!");
      var item = this.get('model');
      console.log(item.changedAttributes());

      var description = this.get('model').get('description');
      var name = this.get('model').get('name');
      var onSuccess = function(item) {
        component.set("details_updated", true);

        Ember.run.later((function() {
          component.set("details_updated", false);
          component.transitionToRoute('upload.view', item);
        }), 1000);
      };

      var onFail = function(item) {
        // deal with the failure here
        component.set("details_not_updated", true);
        console.log(item);

        Ember.run.later((function() {
          component.set("details_not_updated", false);
        }), 5000);

      };


      this.get("apiCall").putItemDetails(item.get('_id'), name, description, onSuccess, onFail);
    },
  textUpdated : function (text) {
      // do something with

      console.log(this.get('model').get('description'));
    }
  }

});
