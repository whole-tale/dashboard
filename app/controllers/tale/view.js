import Ember from 'ember';
import EmberUploader from 'ember-uploader';
const inject = Ember.inject;

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

    init() {
        this.set("tale_instantiated", false);
        this.set('user_id', this.get('userAuth').getCurrentUserID());
        scroll(0, 0);
    },
    didInsertElement() {
        console.log("Controller didUpdate hook is called from nested tale 'view'");
    },
    modelObserver: Ember.observer("model", function(sender, key, value) {
        console.log("Controller model hook is called from nested tale 'view'");
        var model = this.get('model');
        // convert config json to a string for editing.
        // model.set('config', JSON.stringify(model.get('config')));
        console.log(model.get('config'));
    }),
    isOwner: Ember.computed('model.creatorId', 'user_id', function() {
        
        let user_id = this.get("user_id");
        let creator_id = this.get("model").get("creatorId");      
        // TODO: Uncomment below As soon as access control for tales are working
        // const object = this.get('model').toJSON();
        // return this.get('accessControl').fetch(object)
        //     .then(acl => {
        //         // if listed as owner or admin in access control for this tale ...
        //         if (acl.users.find(u=>(u.id===user_id && u.level >= 1))) {
        //             return true;
        //         } 
        //         return false;
        //     });

        return creator_id === user_id;
    }),
    actions: {
        shareTale(tale) {
            const state = this.get('internalState');
            state.setACLObject(tale);
            Ember.$('.acl-component').modal('show');
        },
        updateTale: function() {

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

            var onFail = function(e) {
                // deal with the failure here
                component.set("tale_creating", false);
                component.set("tale_not_created", true);
                component.set("error_msg", e.message);
                console.log(e);

                Ember.run.later((function() {
                    component.set("tale_not_created", false);
                }), 10000);

            };

            var tale = this.get("model");
            tale.save().then(onSuccess).catch(onFail);
        },
        launchTale: function() {
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
                tale.get('imageId'),
                this.get('taleInstanceName'),
                onSuccess,
                onFail);
        },
        textUpdated: function(text) {
            // do something with

            console.log(this.get('model').get('description'));
        },
        back: function() {
            history.back();
        },
        openDeleteModal: function(id) {
            var selector = '.ui.' + id + '.modal';
            console.log("Selector: " + selector);
            $(selector).modal('show');
        },

        approveDelete: function(model) {
            console.log("Deleting model " + model.name);
            var component = this;

            model.destroyRecord({ reload: true }).then(function() {
                component.transitionToRoute('index');
            });

            return false;
        },

        denyDelete: function() {
            return true;
        },

        enableEditIcon() {
            let icon_uri_txt = Ember.$('#tale-icon');
            icon_uri_txt.prop("disabled", false);
            icon_uri_txt.focus();
        },

        generateIcon(model) {
            this.get('store').query('sils', { text: encodeURI(model.title) })
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
