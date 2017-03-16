import Ember from 'ember';

export default Ember.Route.extend({
    init() {
      console.log("In the route for the view in folder");
    },

    model(params, transition) {
      var folderId;

      console.log("In the folder view routes and params is" );
      console.log(params);
      console.log(transition.params);

      if (params.hasOwnProperty("folder_id"))
        folderId = params.folder_id;
      else
        folderId = transition.params['folder.view'].folder_id;

      console.log("The folder ID " + folderId);

      var folderObj = this.store.findRecord('folder', folderId);

      console.log(folderObj);
      return folderObj;
    }

});
