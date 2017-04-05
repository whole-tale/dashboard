import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
  },

  // just checking the toggle works ...
  publicCheckedObserver: Ember.observer('public_checked', function() {
    console.log("Checked = " + this.get('public_checked'));
  }),

  showStep : ["inline", "none", "none", "none"],
  stepsActive : ["active", "", "", ""],
  currentStep : 0,
  public_checked : false,
  frontend : null,
  folder : null,
  nextName : "Next",
  actions: {

    // this is called when someone selected the front end image
    itemSelected: function (model) {
      console.log(model.get('name') + " frontend image has been selected in compose.js...");
      this.set("frontend", model);
    },

    selectedFolder: function(model) {
        console.log(model.get('name'));
        this.set('folder', model);
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

      if(stepNo === 2) {
          this.set('startChooserFromFolder', "registered");
      }

    },

    moveLeft: function () {
      var step = this.get("currentStep");
      if (step !=0)
        this.send("gotoStep", step-1);
    },
    moveRight: function () {
      var step = this.get("currentStep");
      if (step !=3) {
        this.send("gotoStep", step + 1);

        if (step == 2) {
          this.set('nextName', "Submit");
          this.set('startChooserFromFolder', "registered");
        }
        else
          this.set('nextName', "Next");
      } else {
        // submit
        alert("Creating tale: TODO")
      }

    },

  }
});
