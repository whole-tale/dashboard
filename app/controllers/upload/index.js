import Ember from 'ember';

export default Ember.Controller.extend({
  collectionName : "Ians Test Collection",
  collectionID : "5811990986ed1d00011ad6d7",
  fileBreadCrumbs : {},
  currentBreadCrumb : [],
  isRoot : true,
  isNotRoot : false,
  parentId : null,
  init() {
    console.log("Heading into browse upload controller" );

    var bc = {
      "name" : this.get("collectionName"),
      "id" : this.get("collectionID"),
    };

    this.set("currentBreadCrumb", bc);
    this.set("fileBreadCrumbs", null); // new collection, reset crumbs

  },
  actions: {
    itemClicked : function(item, isFolder) {
      console.log(item);
      var itemID = item.get('_id');
      var itemName = item.get('name');
      var myController = this;
      if (isFolder=="true") {
        console.log("Item ID is " + itemID);

        var previousBreadCrumb = this.get("currentBreadCrumb");

        var bc = {
          "name" : itemName,
          "id" : itemID,
        };

        this.set("currentBreadCrumb", bc);

        var fileBreadCrumbs = this.get("fileBreadCrumbs");
        if (fileBreadCrumbs !==null) {

          var bds = fileBreadCrumbs;
          bds.pushObject(previousBreadCrumb);
          fileBreadCrumbs=bds;
        }
        else
          fileBreadCrumbs = [previousBreadCrumb];

        this.set("fileBreadCrumbs", fileBreadCrumbs);

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
        console.log("File clicked " + itemName);
        var url = 'https://girder.wholetale.org/api/v1/item/' + itemID + '/download?contentDisposition=attachment';
        var client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = function() {
          item.set("edit_text", client.responseText);
          myController.transitionToRoute('upload.view', item);
        };
        client.send();
      }
    },
    collectionClicked : function(collectionID, collectionName) {
//      alert("Collection clicked " + collectionName);

      var folderContents = this.store.query('folder', { parentId: collectionID, parentType: "collection"});
      var collections = this.get('store').findAll('collection');

      this.set("collectionID", collectionID);
      this.set("collectionName", collectionName);

      var newModel =  { 'folderContents' : folderContents, 'collections' : collections, 'itemContents' : null};
      this.set("fileData", newModel);

      var bc = {
        "name" : collectionName,
        "id" : collectionID,
      };

      this.set("currentBreadCrumb", bc); // new collection, reset crumbs
      this.set("fileBreadCrumbs", null); // new collection, reset crumbs

    },
    breadcrumbClicked : function(itemName) {
    },
  }
});


