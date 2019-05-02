import Controller from '@ember/controller';
import EmberObject, { observer } from '@ember/object';
import $ from 'jquery';

const O = EmberObject.create.bind(EmberObject);

export default Controller.extend({
  grabData(model) {
    // convert config json to a string for editing
    let controller = this;
    controller.set("error", "");

    model.forEach(tale => {
      controller.get('store').query('instance', { 'taleId': tale.get('id') }).then(instances => {
        tale.set('instance', instances.length > 0 ? instances[0] : null);
        controller.get('store').findRecord('image', tale.get('imageId')).then(image => {
          tale.set('image', image);
          controller.get('store').findRecord('user', tale.get('creatorId'))
            .then(creator => {
              tale.set('creator', O({
                firstName: creator.firstName,
                lastName: creator.lastName,
                orcid: ''
              }));
              controller.get('store').findRecord('folder', tale.get('folderId'))
                .then(folder => {
                  tale.set('folder', folder);
                }).catch(() => {
                  let err = controller.get("error") + "<li>Folder with ID " + tale.get('folderId') + " was not found for tale " + tale.get('title') + "!</li>";
                  controller.set("error", err);
                });
            }).catch(() => {
              let err = controller.get("error") + "<li>User with ID " + tale.get('creatorId') + " was not found for tale " + tale.get('title') + "!</li>";
              controller.set("error", err);
            });
          }).catch((error) => {
            let err = controller.get("error") + "<li>Image with ID " + tale.get('imageId') + " was not found for tale " + tale.get('title') + "! </li>";
            controller.set("error", err);
            console.log(`Failed to fetch image for tale (${tale._id}):`, error);
          });
      }).catch((error) => {
        let err = controller.get("error") + "<li>Instance(s) not found for tale " + tale.get('title') + "! </li>";
        controller.set("error", err);
        console.log(`Failed to fetch instance(s) for tale (${tale._id}):`, error);
      });
    });
  },
  modelObserver: observer("model", function (sender, key, value) {
    // console.log("Controller model hook is called from status 'view'");
    let model = this.get('model');

    this.grabData(model);
  }),
  actions: {
    playTale: function (id) {
      this.set("tale_to_show_url", id);
      this.set("showTale", true);
    },

    openDeleteModal(id) {
      let selector = '.ui.' + id + '.modal';
      $(selector).modal('show');
    },

    approveDelete(model) {
      model.deleteRecord();
      model.save();

      return false;
    },

    denyDelete() {
      return true;
    }
  }
});
