import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  apiCall : Ember.inject.service('api-call'),

  init() {
    this._super(...arguments);
  },

  // just checking the toggle works ...
  publicCheckedObserver: Ember.observer('public_checked', function() {
    console.log("Checked = " + this.get('public_checked'));
  }),

  publicDescriptionObserver: Ember.observer('description', function() {
    console.log("Description = " + this.get('description'));
  }),

  showStep : ["inline", "none", "none", "none"],
  stepsActive : ["active", "", "", ""],
  currentStep : 0,
  public_checked : false,
  frontend : null,
  folder : null,
  nextName : "Next",
  tale_creating: false,
  tale_created: false,
  configuration : JSON.stringify({}),

  clearWizard() {
      this.set("showStep", ["inline", "none", "none", "none"]);
      this.set('stepsActive', ["active", "", "", ""]);
      this.set('currentStep', 0);
      this.set('public_checked', false);
      this.set('frontend', null);
      this.set('folder', null);
      this.set('nextName', "Next");
      this.set('tale_creating', false);
      this.set('tale_created', false);
      this.set('configuration', JSON.stringify({}));
  },

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
        }
        else
          this.set('nextName', "Next");
      } else {

        var component = this;

        component.set("tale_creating", true);

        var onSuccess = function(item) {
          component.set("tale_creating", false);
          component.set("tale_created", true);

          Ember.run.later((function() {
            component.set("tale_created", false);
            component.clearWizard();
            component.transitionToRoute('tale.view', item);
          }), 3000);
        };

        var onFail = function(e) {
          // deal with the failure here
          component.set("tale_creating", false);
          component.set("tale_not_created", true);
          console.log(e);

          Ember.run.later((function() {
            component.set("tale_not_created", false);
          }), 3000);

        };

        let new_tale = this.get('store').createRecord('tale', {
          "config": {},   //TODO: Implement configuration editor
          "description": this.get('description'),
          "folderId":    this.get('folder').get('_id'),
          "imageId":     this.get('frontend').get('_id'),
          "public":      this.get('public_checked'),
          "title":       this.get('title'),
        });

        new_tale.save().then(onSuccess).catch(onFail);
      }

    },

  }
});
