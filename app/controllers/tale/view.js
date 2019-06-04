// import EmberUploader from 'ember-uploader';
// import FileSaver from 'file-saver';
import { inject as service } from '@ember/service';
import Object, { computed, observer } from '@ember/object';
import { later, cancel } from '@ember/runloop';
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
  attributes: computed(function () {
    return ['data-content'];
  })
});

export default Controller.extend({
  store: service(),
  router: service(),
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
  creatorObserver: observer('model.creatorId', function() {
    const model = this.get('model');
    const creatorId = model.get("creatorId");
    this.store.findRecord('user', creatorId).then(creator => {
      this.get("model").set('creator', {
        firstName: creator.firstName,
        lastName: creator.lastName,
        orcid: ''
      });
    })
  }),
  isOwner: computed('model.creatorId', 'user_id', function () {
    const user_id = this.get("user_id");
    const creator_id = this.get("model").get("creatorId");
    return creator_id === user_id;
  }),
  canEditTale: computed('model._accessLevel', function () {
    return this.get('model') && this.get('model').get('_accessLevel') >= taleStatus.WRITE;
  }),
  taleLaunched(instanceId) {
    let self = this;
    // NOTE: using store.query here as a work around to disable store.findAll caching
    this.get('store').query('instance', {
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    }).then(models => {
      // Ensure this view is not destroyed by way of route transition
      if (!self.isDestroyed) {
        let router = self.get('router');
        self.set('rightModelTop', models);
        router.transitionTo('run.view', instanceId);
      }
    });
  },
  actions: {
    shareTale(tale) {
      const state = this.get('internalState');
      state.setACLObject(tale);
      let modalElem = $('.acl-component');
      if (modalElem) {
        modalElem.modal('show');
        if (modalElem.hasClass("scrolling")) {
          modalElem.removeClass("scrolling");
        }
      }
    },
    updateTale() {
      let component = this;
      component.set("tale_creating", true);

      let onSuccess = (item) => {
        component.set("tale_creating", false);
        component.set("tale_created", true);

        later((function () {
          component.set("tale_created", false);
          // component.transitionToRoute('upload.view', item);
        }), 10000);
      };

      let onFail = function (e) {
        // deal with the failure here
        component.set("tale_creating", false);
        component.set("tale_not_created", true);
        component.set("error_msg", e.message);

        later((function () {
          component.set("tale_not_created", false);
        }), 10000);

      };

      let tale = this.get("model");
      tale.save().then(onSuccess).catch(onFail);
    },
    launchTale(tale) {
      let component = this;
      component.set("tale_instantiating_id", tale.id);
      component.set("tale_instantiating", true);
      
      let onSuccess = function (item) {
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);
        
        let instance = Object.create(JSON.parse(item));
        
        component.set("instance", instance);
        
        // Add the new instance to the list of instances in the right panel
        component.taleLaunched(instance.get('_id'));

        later(function () {
          // Ensure this component is not destroyed by way of a route transition
          if (!component.isDestroyed) {
            component.set("tale_instantiated", false);
            component.set("tale_instantiating_id", 0);
          }
        }, 30000);

        let currentLoop = null;
        // Poll the status of the instance every second using recursive iteration
        let startLooping = function (func) {
          return later(function () {
            currentLoop = startLooping(func);
            component.get('store').findRecord('instance', instance.get('_id'), { reload: true })
              .then(model => {
                if (model.get('status') === 1) {
                  component.taleLaunched(instance.get('_id'));
                  cancel(currentLoop);
                }
              });
          }, 1000);
        };

        //Start polling
        currentLoop = startLooping();
      };

      let onFail = function (item) {
        // deal with the failure here
        component.set("tale_instantiating", false);
        component.set("tale_not_instantiated", true);
        item = JSON.parse(item);

        component.set("error_msg", item.message);

        later(function () {
          if (!component.isDestroyed) {
            component.set("tale_not_instantiated", false);
            component.set("tale_instantiating_id", 0);
          }
        }, 10000);

      };

      // submit: API
      // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

      this.get("apiCall").postInstance(
        tale.get("_id"),
        tale.get("imageId"),
        null,
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
    textUpdated(text) {
      // do something with text, but what????
      console.log(this.get('model').get('description'));
    },
    back() {
      history.back();
    },
    openDeleteModal(model) {
      let component = this;
      component.set('selectedTale', model);
      if (!model.get('name')) {
        model.set('name', model.get('title'));
      }
      let selector = `.delete-modal-tale>.ui.delete-modal.modal`;
      later(() => {
        $(selector).modal('show');
      }, 500);
    },

    attemptDeletion(model) {
      let component = this;
      if (model) {
        if (!model.get('name')) {
          model.set('name', model.get('title'));
        }
        let taleId = model.get('_id');
        let instances = component.get('store').query('instance', {
          taleId: taleId,
          reload: true,
          adapterOptions: {
            queryParams: {
              limit: "0"
            }
          }
        }).then((instances) => {
          if (instances && instances.length) {
            let message = `There ${instances.length === 1 ? "is" : "are"} ${instances.length} running instance${instances.length === 1 ? "" : "s"} associated to this tale.`;
            component.set('cannotDeleteMessage', message);
            component.actions.openWarningModal.call(this);
          } else {
            component.actions.openDeleteModal.call(this, model);
          }
        });
      }
    },

    approveDelete(model) {
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
        component.transitionToRoute('browse');
      });

      return false;
    },

    denyDelete() {
      return false;
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
    },

    openWarningModal() {
      let selector = `.ui.warning-modal.modal`;
      $(selector).modal('show');
    }
  }

});
