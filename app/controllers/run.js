import Ember from 'ember';
let inject = Ember.inject;

export default Ember.Controller.extend({
  grabData: function (model) {
    // convert config json to a string for editing.

    console.log(model);
    let controller = this;
    controller.set("error", "");

    model.forEach(function (item) {
      console.log(item);
      console.log("Tale ID is " + item.get('taleId'));

      controller.get('store').findRecord('tale', item.get('taleId')).then(tale => {
        console.log("Image ID = " + tale.get('imageId'));
        console.log("Folder ID = " + tale.get('folderId'));
        controller.get('store').findRecord('image', tale.get('imageId')).then(image => {
          console.log(image);
          item.set('image', image);
          controller.get('store').findRecord('folder', tale.get('folderId')).
          then(folder => {
            item.set('folder', folder);
          }).catch(error => {
            let err = controller.get("error") + "<li>Folder with ID " + tale.get('folderId') + " was not found for tale " + tale.get('title') + "!</li>";
            controller.set("error", err);
          });
        }).catch(error => {
          let err = controller.get("error") + "<li>Image with ID " + tale.get('imageId') + " was not found for tale " + tale.get('title') + "! </li>";
          controller.set("error", err);
        });
      });
    });
  },
  modelObserver: Ember.observer("model", function (sender, key, value) {
    console.log("Controller model hook is called from status 'view'");
    let model = this.get('model');

    this.grabData(model);
  }),
  actions: {
    playTale: function (id) {
      this.set("tale_to_show_url", id);
      this.set("showTale", true);
    },

    openDeleteModal: function (id) {
      let selector = '.ui.' + id + '.modal';
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      model.deleteRecord();
      model.save();

      return false;
    },

    denyDelete: function () {
      return true;
    }
  }
});
