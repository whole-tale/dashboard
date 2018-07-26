import Ember from 'ember';
import EmberUploader from 'ember-uploader';
//import FileSaver from 'file-saver';
const inject = Ember.inject;
const taleStatus = Ember.Object.create({
  NONE: -1,
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
  SITE_ADMIN: 100
});

Ember.TextField.reopen({
  attributes: ['data-content']
});

export default Ember.Controller.extend({
  store: inject.service(),
  apiCall: inject.service('api-call'),
  userAuth: inject.service(),
  accessControl: inject.service(),
  internalState: inject.service(),
  taleInstanceName: "",
  authRequest: Ember.inject.service(),

  init() {
    this.set("tale_instantiated", false);
    this.set('user_id', this.get('userAuth').getCurrentUserID());
    scroll(0, 0);
  },
  didInsertElement() {
    console.log("Controller didUpdate hook is called from nested tale 'view'");
  },
  modelObserver: Ember.observer("model", function (sender, key, value) {
    console.log("Controller model hook is called from nested tale 'view'");
    let model = this.get('model');
    // convert config json to a string for editing.
    // model.set('config', JSON.stringify(model.get('config')));
    console.log(model.get('config'));
  }),
  isOwner: Ember.computed('model.creatorId', 'user_id', function () {
    const user_id = this.get("user_id");
    const creator_id = this.get("model").get("creatorId");
    return creator_id === user_id;
  }),
  canEditTale: Ember.computed('model._accessLevel', function () {
    return this.get('model') && this.get('model').get('_accessLevel') >= taleStatus.WRITE;
  }),
  actions: {
    shareTale(tale) {
      const state = this.get('internalState');
      state.setACLObject(tale);
      let modalElem = $('.acl-component');
      if(modalElem) {
        modalElem.modal('show');
        if(modalElem.hasClass("scrolling")) {
          modalElem.removeClass("scrolling");
        }
      }
    },
    updateTale: function () {
      let component = this;
      component.set("tale_creating", true);

      let onSuccess = function (item) {
        component.set("tale_creating", false);
        component.set("tale_created", true);

        Ember.run.later((function () {
          component.set("tale_created", false);
          // component.transitionToRoute('upload.view', item);
        }), 10000);
      };

      let onFail = function (e) {
        // deal with the failure here
        component.set("tale_creating", false);
        component.set("tale_not_created", true);
        component.set("error_msg", e.message);
        console.log(e);

        Ember.run.later((function () {
          component.set("tale_not_created", false);
        }), 10000);

      };

      let tale = this.get("model");
      tale.save().then(onSuccess).catch(onFail);
    },
    launchTale: function () {
      let component = this;
      component.set("tale_instantiating", true);

      let onSuccess = function (item) {
        console.log(item);
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);

        let instance = Ember.Object.create(JSON.parse(item));

        component.set("instance", instance);

        Ember.run.later((function () {
          component.set("tale_instantiated", false);
        }), 30000);
      };

      let onFail = function (item) {
        // deal with the failure here
        component.set("tale_instantiating", false);
        component.set("tale_not_instantiated", true);
        item = JSON.parse(item);

        console.log(item);
        component.set("error_msg", item.message);

        Ember.run.later((function () {
          component.set("tale_not_instantiated", false);
        }), 10000);

      };

      // submit: API
      // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

      let tale = this.get("model");

      this.get("apiCall").postInstance(
        tale.get("_id"),
        tale.get('imageId'),
        this.get('taleInstanceName'),
        onSuccess,
        onFail);
    },



    publishTale: function(id) {
        let modalDlg = Ember.$('.ui.publisher.modal');
        modalDlg.parent().prependTo(Ember.$(document.body));
        modalDlg.modal('show');
        console.log('asdf')
    },
    
    /*
    exportTale: function() {
        var tale = this.get('model');
        var success = function(client, filename) {
            // Use the HTML5 Blob [1] API to send the file to the user. 
            // There are two caveats here:
            // 
            //    1. Blob is used in favor of File [2] because Blob has 
            //       wider support across browsers
            //    2. AFAIK this loads the response in memory in the user's
            //       browser so this will not scale well to large files
            // 
            // [1] https://developer.mozilla.org/en-US/docs/Web/API/Blob
            // [2] https://developer.mozilla.org/en-US/docs/Web/API/File/File
            //
            // TODO: Find a good solution to the above problem
            var file = new Blob([client.response], { type: 'application/zip' })
            FileSaver.saveAs(file, filename);
        }

        var fail = function(client) {
            // TODO: Handle this error state better
            console.log("Failed to export Tale.", client);
        }

        this.get('apiCall').exportTale(tale.get("_id"), success, fail);
    },
    */
    textUpdated: function (text) {
      // do something with
      console.log(this.get('model').get('description'));
    },
    back: function () {
      history.back();
    },
    openDeleteModal: function (id) {
      const selector = '.ui.' + id + '.modal';
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
        component.transitionToRoute('index');
      });

      return false;
    },

    denyDelete: function () {
      return true;
    },

    enableEditIcon() {
      let icon_uri_txt = Ember.$('#tale-icon');
      icon_uri_txt.prop("disabled", false);
      icon_uri_txt.focus();
    },

    generateIcon(model) {
      this.get('store').query('sils', {
          text: encodeURI(model.title)
        })
        .then(sils => {
          sils.forEach(result => {
            model.set('illustration', result.get('icon'));
          })
        });
    },
    gotoFolderView() {
      this.transitionToRoute("folder.view", this.folder);
    },
    gotoImageView() {
      this.transitionToRoute("image.view", this.image);
    }
  },


});
