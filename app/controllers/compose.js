import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
  },

  showStep : ["inline", "none", "none", "none"],
  stepsActive : ["active", "", "", ""],
  currentStep : 0,
  actions: {

    closedMiniBrowser : function () {

    },
    selectedFile: function () {

    },

    gotoStep : function (stepNo) {
      console.log("Going to step no " + stepNo);
      var stepsActive = this.get("stepsActive");
      for (var i=0;  i< stepsActive.length; ++i) {
        Ember.set(stepsActive, i.toString(), "");
      }

      Ember.set(stepsActive, stepNo.toString(), "active");

      var showStep = this.get("showStep");
      for (i=0;  i< showStep.length; ++i) {
        Ember.set(showStep, i.toString(), "none");
      }

      Ember.set(showStep, stepNo.toString(), "inline");

      //this.set("stepsActive", stepsActive);
      //this.set("showStep", showStep);

      console.log(this.get("showStep"));
      console.log(this.get("stepsActive"));

      this.set("currentStep", stepNo);

    },

    moveLeft: function () {
      var step = this.get("currentStep");
      if (step !=0)
        this.send("gotoStep", step-1);
    },
    moveRight: function () {
      var step = this.get("currentStep");
      if (step !=3)
        this.send("gotoStep", step+1);
    },

      updatedetails: function(name) {
      this.set('researchdetails', false);
    },

  }
});
