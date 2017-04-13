import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  registeredActive: "active",
  imagesActive: "",
  talesActive: "",
  showRegistered: true,
  showImages: false,
  showTales: false,
  init() {

  },
  actions: {
    registered: function() {
      this.set("registeredActive", "active");
      this.set("imagesActive", "");
      this.set("talesActive", "");
      this.set("showRegistered", true);
      this.set("showImages",false);
      this.set("showTales", false);
    },
    images: function() {
      this.set("registeredActive", "");
      this.set("imagesActive", "active");
      this.set("talesActive", "");
      this.set("showRegistered", false);
      this.set("showImages",true);
      this.set("showTales", false);
    },
    tales: function() {
      this.set("registeredActive", "");
      this.set("imagesActive", "");
      this.set("talesActive", "active");
      this.set("showRegistered", false);
      this.set("showImages",false);
      this.set("showTales", true);
    },
    gotoPublish : function(name) {
      this.transitionToRoute("compose");
    },
    clickedAddNewResearchEnvironment() {

    },
    clickedRegisterNewDataset() {
      let modal = Ember.$('.ui.harvester.modal');
      modal.parent().prependTo(Ember.$(document.body));
      modal.modal('show');
    }
  }

});
