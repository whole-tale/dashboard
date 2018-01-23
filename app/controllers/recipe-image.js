import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  apiCall : Ember.inject.service('api-call'),
  store: Ember.inject.service(),

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

  urlObserver: Ember.observer('recipe_url', function() {
      let isEmpty = !this.get("recipe_url") || !this.get("commit_id");
      this.set("importButtonDisabled", isEmpty);
  }),

  commitIdObserver: Ember.observer('commit_id', function() {
      let isEmpty = !this.get("recipe_url") || !this.get("commit_id");
      this.set("importButtonDisabled", isEmpty);
  }),

  imageDockerNameObserver: Ember.observer('imageDockerName', function() {
    let imageDockerName = this.get('imageDockerName');
    let imageUser = imageDockerName.split('/').pop();
    let imageWorkDirectory = `/home/${imageUser}/work`;
    this.set('imageUser', imageUser);
    this.set('imageWorkDirectory', imageWorkDirectory);
  }),

  imageIdObserver: Ember.observer('imageId', function() {
    const component = this;
    const store = this.get('store');
    store.findRecord('image', this.get('imageId'))
      .then(_imageDetails => {
        component.set('selectedImage', _imageDetails);
        component.set('imageDetails', _imageDetails.toJSON());
        return store.findRecord('recipe', _imageDetails.get('recipeId'));
      })
      .then(_recipeDetails => {
        component.set('recipeDetails', _recipeDetails.toJSON());
      })
      .catch(e => {
        console.log(e);
      })
    ;
  }),

  showStep : ["inline", "none", "none"],
  stepsActive : ["active", "", ""],
  currentStep : 0,
  public_checked : false,
  frontend : null,
  folder : null,
  tags: Ember.A(),
  imageDetails: null,
  recipeDetails: null,
  recipeId: '',
  imagePublic: false,
  imageTags: Ember.A(),
  imageName: '',
  imageDockerName: '',
  imageIconURL: '',
  imageWorkDirectory: '',
  imageUser: '',
  imageCommand: '',
  imageDescription: '',
  imageUrlPath: '',
  imagePort: null,
  nextName : "Import Recipe",
  showSkipButton: true,
  importButtonDisabled: true,
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

  showRecipeError(message) {
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
      var component = this;
      if (!this.get("name")) {
        component.showRecipeError("Recipe name cannot be left blank");
        return;
      }
      component.set("creating", true);

      var onSuccess = function(item) {
        component.set("creating", false);
        component.set("created", true);
        Ember.run.later((function() {
            component.set("created", false);
            //Reset the recipe form fields
            component.set("recipe_url", null);
            component.set("commit_id", null);
            component.set("name", null);
            component.set("description", null);
            component.set("public_checked", false);
            component.set("tags", []);
            component.set("show_errors", false);
        }), 3000);
        //Move to next step
        component.send("skip");
      };

      var onFail = function(error) {
        // TODO display error message on relevant input elements
        // deal with the failure here
        component.showRecipeError(error.responseJSON.message);
      };

      let newRecipe = this.get("store").createRecord("recipe", {});
      newRecipe.save({adapterOptions: { queryParams: {
        url:         this.get("recipe_url"),
        commitId:    this.get("commit_id"),
        name:        this.get("name"),
        description: this.get("description"),
        public:      this.get("public_checked"),
        tags:        this.get("tags"),
      }}}).then(onSuccess).catch(onFail);
    },

    saveImage() {
      const component = this;

      if (!this.get('imageDockerName') || !this.get('recipeId')) {
        component.showImageError('Image docker name and recipe must not be blank.');
        return;
      }

      component.set("creating", true);

      let query = {
        recipeId:    this.get('recipeId'),
        fullName:    this.get('imageDockerName'),
        name:        this.get('imageName'),
        description: this.get('imageDescription'),
        public:      this.get('imagePublic'),
        icon:        this.get('imageIconURL'),
        tags:        this.get('imageTags'),
        config:      JSON.stringify({
          command: this.get('imageCommand'),
          targetMount: this.get('imageWorkDirectory'),
          user: this.get('imageUser'),
          urlPath: this.get('imageUrlPath'),
          port: Number.parseInt(this.get('imagePort'))
        })
      };

      let newImage = this.get('store').createRecord('image', {});
      newImage.save({adapterOptions: { queryParams: query }})
        .then(_image => {
          component.set("created", true);
          Ember.run.later((function() {
            component.set("created", false);
            //Reset the image form fields
            component.set("recipeId", null);
            component.set("imageDockerName", '');
            component.set("imageName", '');
            component.set("imageDescription", '');
            component.set("imagePublic", false);
            component.set("imageTags", []);
            component.set("imageCommand", '');
            component.set("imageIconURL", '');
            component.set("imageWorkDirectory", '');
            component.set("imageUser", '');
            component.set("show_errors", false);
            component.set("imageUrlPath", '');
            component.set("imagePort", null);
          }), 3000);
          component.send("skip");
        })
        .catch(e => {
          component.showRecipeError(e.responseJSON.message);
        })
        .finally(() => {
          component.set('creating', false);
        });
  },

  buildImage() {
    if (this.get('creating')) { return; }
    const component = this;
    let image = this.get('selectedImage');
    component.set('creating', true);
    image.save({adapterOptions:{appendPath:'build'}})
      .then(_image => {
        component.set('created', true);
        Ember.run.later((function() {
          component.set("created", false);
          //Reset the image form fields
          component.set("recipeDetails", null);
          component.set("imageDetails", null);
          component.set("imageId", null);
        }), 3000);
      })
      .catch(e => {
        console.log(e);
        component.showRecipeError(e.responseJSON.message);
      })
      .finally(() => {
        component.set('creating', false);
      })
    ;
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
      this.set('showSkipButton', false);
      this.set('importButtonDisabled', false);

      if(stepNo <= 1) {
          this.set('showSkipButton', true);
          this.set('importButtonDisabled', !this.get("recipe_url") && !this.get("commit_id"));
      }

      if(stepNo === 2) {
          this.set('startChooserFromFolder', "registered");
      }

    },

    moveLeft: function () {
      var step = this.get("currentStep");
      if (step !=0) {
        this.send("gotoStep", step - 1);
      }
    },

    moveRight: function () {
      var step = this.get("currentStep");
      if (step === 0) {
          this.saveRecipe();
      } else if (step === 1) {
          this.saveImage();
      } else {
          this.buildImage();
      }
    },

    skip: function(){
        let nextStep = this.get('currentStep') + 1;
        this.send("gotoStep", nextStep);
    },
  }
});
