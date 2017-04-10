import Ember from 'ember';
var inject = Ember.inject;


export default Ember.Controller.extend({
  modelObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller model hook is called from status 'view'");
    var model = this.get('model');
    // convert config json to a string for editing.

    console.log(model);

    var controller =this;
    model.forEach(function(item){
      console.log(item);
      console.log("Tale ID is " + item.get('taleId'));

      item.set("fullUrl", "http://wttmpnb.hub.yt/" + item.get('url'));

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
  }),
  actions: {
    deleteInstance: function (model) {
      console.log("Delete instance " + model.name);
        model.destroyRecord(
          function (success) {
              console.log(success);
        }, function (failure) {
            console.log(failure);
        });
    },
  }
});
