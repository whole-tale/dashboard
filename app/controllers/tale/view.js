// import EmberUploader from 'ember-uploader';
// import FileSaver from 'file-saver';
import { inject as service } from '@ember/service';
import Object, { computed, observer } from '@ember/object';
import { run } from '@ember/runloop';
import Controller from '@ember/controller';
import $ from 'jquery';
import TextField from '@ember/component/text-field';

const taleStatus = Object.create({
  NONE: -1,
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
  SITE_ADMIN: 100
});

TextField.reopen({
  attributes: computed(function() {
    return ['data-content'];
  })
});

export default Controller.extend({
  store: service(),
  apiCall: service('api-call'),
  userAuth: service(),
  accessControl: service(),
  internalState: service(),
  taleInstanceName: '',
  authRequest: service(),

  init() {
    this._super(...arguments);
    this.set('tale_instantiated', false);
    this.set('user_id', this.get('userAuth').getCurrentUserID());
    scroll(0, 0);
  },
  didInsertElement() {
    console.log("Controller didUpdate hook is called from nested tale 'view'");
  },
  modelObserver: observer("model", function (sender, key, value) {
    console.log("Controller model hook is called from nested tale 'view'");
    let model = this.get('model'); // this is assigned but never used!
  }),
  isOwner: computed('model.creatorId', 'user_id', function () {
    const user_id = this.get("user_id");
    const creator_id = this.get("model").get("creatorId");
    return creator_id === user_id;
  }),
  canEditTale: computed('model._accessLevel', function () {
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

      let onSuccess = (item) => {
        component.set("tale_creating", false);
        component.set("tale_created", true);

        run.later((function () {
          component.set("tale_created", false);
          // component.transitionToRoute('upload.view', item);
        }), 10000);
      };

      let onFail = function (e) {
        // deal with the failure here
        component.set("tale_creating", false);
        component.set("tale_not_created", true);
        component.set("error_msg", e.message);

        run.later((function () {
          component.set("tale_not_created", false);
        }), 10000);

      };

      let tale = this.get("model");
      tale.save().then(onSuccess).catch(onFail);
    },
    launchTale: function () {
      debugger;
      let component = this;
      component.set("tale_instantiating", true);

      let onSuccess = function (item) {
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);

        let instance = Object.create(JSON.parse(item));
        component.set("instance", instance);

        run.later((function () {
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

        run.later((function () {
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
      // do something with text, but what????
      console.log(this.get('model').get('description'));
    },
    back: function () {
      history.back();
    },
    openDeleteModal: function (id) {
      const selector = '.ui.' + id + '.modal';
      $(selector).modal('show');
    },

    approveDelete: function (model) {
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
      let icon_uri_txt = $('#tale-icon');
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
