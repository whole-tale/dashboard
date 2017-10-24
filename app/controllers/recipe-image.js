import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  apiCall : Ember.inject.service('api-call'),

  init() {
    this._super(...arguments);

    Ember.run.schedule('afterRender', function() {
        $(".recipes.grey.circle.help.icon").hover(function() {
                $("#recipe-info-data-content").removeClass("hidden");
            },
            function() {
                $("#recipe-info-data-content").addClass("hidden");
            }
        );
    });
  },

  // just checking the toggle works ...
  publicCheckedObserver: Ember.observer('public_checked', function() {
    console.log("Checked = " + this.get('public_checked'));
  }),

  publicDescriptionObserver: Ember.observer('description', function() {
    console.log("Description = " + this.get('description'));
  }),

  recipeIdObserver: Ember.observer('recipeId', function() {

  }),

  showStep : ["inline", "none", "none"],
  stepsActive : ["active", "", ""],
  currentStep : 0,
  public_checked : false,
  frontend : null,
  folder : null,
  tags: Ember.A(),
  recipeId: '',
  imageTags: Ember.A(),
  imageName: '',
  imageDockerName: '',
  imageIconURL: '',
  imageDescription: '',
  nextName : "Import Recipe",
  tale_creating: false,
  tale_created: false,
  configuration : JSON.stringify({}),

  clearWizard() {
      this.set("showStep", ["inline", "none", "none"]);
      this.set('stepsActive', ["active", "", "", ""]);
      this.set('currentStep', 0);
      this.set('public_checked', false);
      this.set('frontend', null);
      this.set('folder', null);
      this.set('nextName', "Import Recipe");
      this.set('tale_creating', false);
      this.set('tale_created', false);
      this.set('configuration', JSON.stringify({}));
  },
  showError(message) {
      this.set("creating", false);
      this.set("not_created", true);

      this.set("error_message", message);
      this.set("show_errors", true);

      var component = this;
      Ember.run.later((function() {
        component.set("not_created", false);
      }), 3000);
  },
  saveRecipe() {
    var recipe_url = this.get("recipe_url");
    var commit_id = this.get("commit_id");
    if(recipe_url || commit_id) {
      var component = this;
      if (!this.get("name")) {
        component.showError("Recipe name cannot be left blank");
        return;
      }
      component.set("creating", true);

      var onSuccess = function(item) {
        component.set("creating", false);
        component.set("created", true);
        Ember.run.later((function() {
          component.set("created", false);
          //clear form content on success
          component.set("recipe_url", null);
          component.set("commit_id", null);
          component.set("name", null);
          component.set("description", null);
          component.set("public_checked", false);
          component.set("tags", null);
          component.set("show_errors", false);
        }), 3000);
        //Move to next step
        component.send("gotoStep", 1);
        component.send('getButtonNextName', 1);
      };

      var onFail = function(error) {
        // deal with the failure here
        component.showError(error.responseJSON.message)
      };

      let newRecipe = this.get("store").createRecord("recipe", {});
      newRecipe.save({adapterOptions: { queryParams: {
        url:         recipe_url,
        commitId:    commit_id,
        name:        this.get("name"),
        description: this.get("description"),
        public:      this.get("public_checked"),
        tags:        this.get("tags"),
      }}}).then(onSuccess).catch(onFail);
    }
    else {
      //Move to next step
      this.send("gotoStep", 1);
      this.send('getButtonNextName', 1);
    }
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

    getButtonNextName(nextStep) {
        if (nextStep <= 0) {
            this.set('nextName', "Import Recipe");
        } else if (nextStep === 1) {
            this.set('nextName', "Create Image");
        } else if (nextStep >= 2) {
            this.set('nextName', "Build");
        }
    },

    moveLeft: function () {
      var step = this.get("currentStep");
      if (step !=0) {
        this.send("gotoStep", step - 1);
        this.send('getButtonNextName', step - 1);
      }
    },
    moveRight: function () {
      var step = this.get("currentStep");
      if (step === 0) {
          this.saveRecipe();
      }
      else if (step !=2) {
          this.send("gotoStep", step + 1);
          this.send('getButtonNextName', step+1);
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
