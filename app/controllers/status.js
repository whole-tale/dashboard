import Ember from 'ember';
var inject = Ember.inject;


export default Ember.Controller.extend({
  grabData : function (model) {
    // convert config json to a string for editing.

    console.log(model);

    var controller =this;
    model.forEach(function(item){
      console.log(item);
      console.log("Tale ID is " + item.get('taleId'));

      item.set("fullUrl", "https://wttmpnb.hub.yt/" + item.get('url'));

      controller.get('store').findRecord('tale', item.get('taleId')).
      then(tale => {
        console.log("Image ID = " + tale.get('imageId'));
        console.log("Folder ID = " + tale.get('folderId'));
        controller.get('store').findRecord('image', tale.get('imageId')).
        then(image => {
          console.log(image);
          item.set('image', image);
          controller.get('store').findRecord('folder', tale.get('folderId')).
          then(folder => {
            item.set('folder', folder);
          });
        });
      });
    });
  },
  modelObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller model hook is called from status 'view'");
    var model = this.get('model');

    this.grabData(model);
  }),
  actions: {

    openDeleteModal: function(id) {
      var selector = '.ui.' + id + '.modal';
      console.log("Selector: " +  selector);
      $(selector).modal('show');
    },

    approveDelete: function(model) {
      console.log("Deleting model " + model.name);
      model.deleteRecord();
      model.save();

      return false;
    },

    denyDelete: function() {
      return true;
    }
  }
});
