import Ember from 'ember';

export default Ember.Controller.extend({
  collectionName : "Ians Test Collection",
  collectionID : "5811990986ed1d00011ad6d7",
  isRoot : true,
  isNotRoot : false,
  parentId : null,
  actions: {
    itemClicked : function(itemID, itemName, isFolder) {
      if (isFolder="true") {
        console.log("Item ID is " + itemID);

        var myController = this;

        this.store.find('folder', itemID).then( function (folder) {
          console.log(JSON.stringify(folder));

          console.log(folder.get('parentId').toString());

          var isRoot =false;

          //var parentFolder = myController.store.find('folder');

         // if (parentFolder == null)
           // isRoot=true;

          myController.set("parentId", folder.parentId);
          myController.set("isRoot", isRoot);
          myController.set("isNotRoot", !isRoot);

          var folderContents = myController.store.query('folder', { parentId: itemID, parentType: "folder"});

          var itemContents = myController.store.query('item', { folderId: itemID});

          var collections = myController.store.findAll('collection');

          var newModel = {'folderContents':folderContents,'itemContents': itemContents,'collections':collections};

          //   alert("Folder clicked and delving into " + itemName);

          console.log(newModel);

          myController.set("fileData", newModel);
        });

      }
      else {
        alert("File clicked " + item);
        // set("parentId", folder.parentId);
        // set("isRoot", isRoot);
        // set("isNotRoot", !isRoot);
      }
    },
    collectionClicked : function(fileID, FileName) {
      alert("Collection clicked " + fileName);

    },
}
});


