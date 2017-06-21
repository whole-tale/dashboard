import Ember from 'ember';
import EmberUploader from 'ember-uploader';
var inject = Ember.inject;


export default Ember.Controller.extend({
  store: Ember.inject.service(),
  apiCall : Ember.inject.service('api-call'),
  taleInstanceName : "",
  init() {
    this.set("tale_instantiated", false);
    scroll(0,0);
  },
  didInsertElement() {
    console.log("Controller didUpdate hook is called from nested tale 'view'");
  },
  modelObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller model hook is called from nested tale 'view'");
    var model = this.get('model');
    // convert config json to a string for editing.
    model.set('config', JSON.stringify(model.get('config')));
    console.log(model.get('config'));
  }),
  actions: {
  updateTale: function () {

      var component = this;

      component.set("tale_creating", true);

      var onSuccess = function(item) {
        component.set("tale_creating", false);
        component.set("tale_created", true);

        Ember.run.later((function() {
          component.set("tale_created", false);
          // component.transitionToRoute('upload.view', item);
        }), 10000);
      };

      var onFail = function(item) {
        // deal with the failure here
        component.set("tale_creating", false);
        component.set("tale_not_created", true);
        item = JSON.parse(item);
        component.set("error_msg", item.message);
        console.log(item);

        Ember.run.later((function() {
          component.set("tale_not_created", false);
        }), 10000);

      };

      // submit: API
      // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

    var tale = this.get("model");

      this.get("apiCall").postTale(
        "put",
        tale.get("_id"),
        null,
        null,
        null,
        tale.get('name'),
        tale.get('description'),
        tale.get('public'),
        tale.get('config'),
        onSuccess,
        onFail);

  },
    launchTale: function () {
      var component = this;

      component.set("tale_instantiating", true);

      var onSuccess = function(item) {
        console.log(item);
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);

        var instance = Ember.Object.create(JSON.parse(item));

        component.set("instance", instance);

        Ember.run.later((function() {
           component.set("tale_instantiated", false);
         }), 30000);
      };

      var onFail = function(item) {
        // deal with the failure here
        component.set("tale_instantiating", false);
        component.set("tale_not_instantiated", true);
        item = JSON.parse(item);

        console.log(item);
        component.set("error_msg", item.message);

        Ember.run.later((function() {
          component.set("tale_not_instantiated", false);
        }), 10000);

      };

      // submit: API
      // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

      var tale = this.get("model");

      this.get("apiCall").postInstance(
        tale.get("_id"),
        this.get('taleInstanceName'),
        onSuccess,
        onFail);
  },
      textUpdated : function (text) {
      // do something with

      console.log(this.get('model').get('description'));
    },
    back : function () {
      history.back();
    },
    openDeleteModal: function(id) {
      var selector = '.ui.' + id + '.modal';
      console.log("Selector: " +  selector);
      $(selector).modal('show');
    },

    approveDelete: function(model) {
      console.log("Deleting model " + model.name);
      var component = this;

      model.destroyRecord({ reload: true }).then( function () {
        component.transitionToRoute('index');
      });

      return false;
    },

    denyDelete: function() {
      return true;
    }
  },


});
