import Controller from '@ember/controller';
import { observer } from '@ember/object';
import $ from 'jquery';

export default Controller.extend({
  grabData(model) {
    // convert config json to a string for editing
    let controller = this;
    controller.set("error", "");

    model.forEach(tale => {
      controller.get('store').query('instance', { queryParams: { 'taleId': tale.get('id') } }).then(instances => {
        instances.forEach(instance => {
          tale.set('instance', instance);
          controller.get('store').findRecord('image', tale.get('imageId')).then(image => {
            tale.set('image', image);
            controller.get('store').findRecord('folder', tale.get('folderId')).
              then(folder => {
                tale.set('folder', folder);
              }).catch(() => {
                let err = controller.get("error") + "<li>Folder with ID " + tale.get('folderId') + " was not found for tale " + tale.get('title') + "!</li>";
                controller.set("error", err);
              });
          }).catch(() => {
            let err = controller.get("error") + "<li>Image with ID " + tale.get('imageId') + " was not found for tale " + tale.get('title') + "! </li>";
            controller.set("error", err);
          });
        });
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
