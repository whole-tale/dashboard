import Ember from 'ember';
var inject = Ember.inject;

function wrapItem (itemID, itemName, isCollection) {
  return {
    "name": itemName,
    "id": itemID,
    "isCollection": isCollection,
    get: function (name) {
      if (name === "name") return itemName;
      else if (name === "id") return itemID;
      else return null;
    }
  }
}

export default Ember.Controller.extend({
  internalState: inject.service(),
  fileBreadCrumbs : {},
  currentBreadCrumb : [],
  isRoot : true,
  isNotRoot : false,
  parentId : null,
  collectionID : null,
  collectionName : null,
  init() {
    var state = this.get('internalState');

    state.setCurrentFolderID(null);

    console.log("Heading into browse upload controller" );

    this.set("collectionID", state.getCurrentCollectionID());
    this.set("collectionName", state.getCurrentCollectionName());

    var bc = wrapItem(state.getCurrentCollectionID(), state.getCurrentCollectionName(), true);

    this.set("currentBreadCrumb", bc);
    this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs()); // new collection, reset crumbs

    state.setCurrentBreadCrumb(bc);
    state.setCurrentFileBreadcrumbs(state.getCurrentFileBreadcrumbs()); // new collection, reset crumbs
  },
  actions: {
    itemClicked : function(item, isFolder) {
      var state = this.get('internalState');
      console.log(item);
      var itemID = item.get('_id');
      var itemName = item.get('name');
      var myController = this;
      if (isFolder=="true") {
        console.log("Item ID is " + itemID);

        state.setCurrentFolderID(itemID);

        var previousBreadCrumb = state.getCurrentBreadCrumb();

        var bc = wrapItem(itemID, itemName, false);

        state.setCurrentBreadCrumb(bc);

        console.log("State toString " + state.toString());

        var fileBreadCrumbs = state.getCurrentFileBreadcrumbs();
        if (fileBreadCrumbs !==null) {

          var bds = fileBreadCrumbs;
          bds.pushObject(previousBreadCrumb);
          fileBreadCrumbs=bds;
        }
        else
          fileBreadCrumbs = [previousBreadCrumb];

        state.setCurrentFileBreadcrumbs(fileBreadCrumbs);

        console.log("State toString " + state.toString());

        this.set("currentBreadCrumb", state.getCurrentBreadCrumb());
        this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs());

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
          console.log(state.toString());

          myController.set("fileData", newModel);
        });

      }
      else {
          myController.transitionToRoute('upload.view', item);
      }
    },
    collectionClicked : function(collectionID, collectionName) {
//      alert("Collection clicked " + collectionName);
      var state = this.get('internalState');

      var folderContents = this.store.query('folder', { parentId: collectionID, parentType: "collection"});
      var collections = this.get('store').findAll('collection');

      state.setCurrentCollectionID(collectionID);
      state.setCurrentCollectionName(collectionName);

      state.setCurrentFolderID(null);

      var newModel =  { 'folderContents' : folderContents, 'collections' : collections, 'itemContents' : null};
      this.set("fileData", newModel);

      var bc = wrapItem(collectionID, collectionName, true);

      state.setCurrentBreadCrumb( bc); // new collection, reset crumbs
      state.setCurrentFileBreadcrumbs(null); // new collection, reset crumbs

      this.set("fileBreadCrumbs", null);
      this.set("currentBreadCrumb", bc);

      this.set("collectionID", collectionID);
      this.set("collectionName", collectionName);

      console.log("New collection name is: " + collectionName);
      console.log(state.toString());

    },
    breadcrumbClicked : function(item) {
      var state = this.get('internalState');
      var crumbs = state.getCurrentFileBreadcrumbs();

      console.log("Breadcrumb clicked on item ");
      console.log(item);

      var newCrumbs = [];
      for (var i; i< crumbs.length; ++i) {
          if (crumbs[i].name === item.name) {
            break;
          } else
            newCrumbs.append(crumbs[i]);
      }

      if (item.isCollection)
        this.send('collectionClicked',item.id, item.name);
      else
        this.send('itemClicked', item, "true");
    },
  }
});




