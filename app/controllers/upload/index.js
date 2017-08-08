import Ember from 'ember';
var inject = Ember.inject;

function wrapFolder(folderID, folderName) {
    return {
        "name": folderName,
        "id": folderID,
        "isFolder": true,

        get: function(name) {
            if (name === "name") return folderName;
            else if (name === "id") return folderID;
            else return null;
        }
    };
}

export default Ember.Controller.extend({
    internalState: inject.service(),
    store: inject.service(),
    folderNavs: inject.service(),
    fileBreadCrumbs: {},
    currentBreadCrumb: [],
    currentNavCommand: "home",
    currentNavTitle: "Home",
    parentId: null,
    file: "",
    fileChosen: Ember.observer('file', function() {
        if (this.get('file') === "") return;
        let uploader = Ember.$('.nice.upload.hidden');
        let files = uploader[0].files;
        let dz = window.Dropzone.forElement(".dropzone");
        for (let i = 0; i < files.length; i++) {
            dz.addFile(files[i]);
        }
        this.set('file', "");
    }),
    init() {
        var state = this.get('internalState');
        this.set("currentFolderId", state.getCurrentFolderID());
        // console.log("Heading into browse upload controller" );

        var currentNav = this.get("folderNavs").getCurrentFolderNavAndSetOn(this);

        // console.log(currentNav);

        if (currentNav != null) {
            this.set("currentNavCommand", currentNav.command);
            this.set("currentNavTitle", currentNav.name);
        }

        var bc = wrapFolder(state.getCurrentFolderID(), state.getCurrentFolderName());

        // console.log(bc);

        var fileBreadCrumbs = state.getCurrentFileBreadcrumbs();
        if (fileBreadCrumbs == null) {
            fileBreadCrumbs = [];
            state.setCurrentFileBreadcrumbs(fileBreadCrumbs); // new collection, reset crumbs
        }

        this.set("currentBreadCrumb", bc);
        this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs()); // new collection, reset crumbs

        state.setCurrentBreadCrumb(bc);
    },
    actions: {
        refresh() {
            // console.log("refreshed");
            var state = this.get('internalState');
            var myController = this;
            let itemID = state.getCurrentFolderID();

            var folderContents = myController.store.query('folder', { parentId: itemID, parentType: "folder" });

            var itemContents = myController.store.query('item', { folderId: itemID });

            var newModel = { 'folderContents': folderContents, 'itemContents': itemContents };

            //   alert("Folder clicked and delving into " + itemName);

            // console.log(newModel);
            // console.log(state.toString());

            myController.set("fileData", newModel);
        },
        navClicked: function(nav) {
            //   console.log("Folder Nav clicked " + nav.command);
            let controller = this;
            var state = this.get('internalState');

            var folderContents = null;
            var itemContents = null;

            state.setCurrentNavCommand(nav.command);
            this.set("currentNavCommand", nav.command);
            this.set("currentNavTitle", nav.name);

            if (nav.command === "home" || nav.command === "user_data") {
                folderContents = this.store.query('folder', { "parentId": nav.parentId, "parentType": nav.parentType, "name": nav.name })
                    .then(folders => {
                        if (folders.length) {
                            itemContents = controller.store.query('item', { "folderId": folders.content[0].id });
                            return controller.store.query('folder', { "parentId": folders.content[0].id, "parentType": "folder" });
                        }
                        throw new Error("Home folder not found.");
                    })
                    .catch(e => { console.log(["Failed to fetch contents of home folder", e]); });
            } else if (nav.command === "workspace") {
                //TODO: I don't know what the workspace is exactly. Whether this will be a folder in the home directory or something else...
            } else if (nav.command === "recent") {
                var uniqueSetOfRecentFolders = [];
                var recentFolders = state.getRecentFolders().filter(folder => {
                    let index = uniqueSetOfRecentFolders.findIndex(added => {
                        return added === folder;
                    });
                    let isAdded = index < 0 ? false : true;
                    if (!isAdded) {
                        uniqueSetOfRecentFolders.push(folder);
                        return true;
                    }
                    return false;
                });
                var payload = JSON.stringify({ "folder": recentFolders });
                // console.log(payload);
                folderContents = this.store.query('resource', { "resources": payload });
                // console.log(folderContents);
                // alert("Not implemented yet ...");
            }

            var newModel = {};
            folderContents
                .then(_folderContents => {
                    newModel.folderContents = _folderContents;
                    return itemContents;
                })
                .then(_itemContents => {
                    newModel.itemContents = _itemContents;
                })
                .finally(_ => {
                    controller.set("fileData", newModel);
                });

            state.setCurrentBreadCrumb(null);
            state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
            state.setCurrentFolderID(null);
            state.setCurrentFolderName("");

            this.set("currentFolderId", null);
            this.set("currentBreadCrumb", null);
            this.set("fileBreadCrumbs", null);

        },
        itemClicked: function(item, isFolder) {
            var state = this.get('internalState');
            var myController = this;

            var itemID = item.get('_id');
            var itemName = item.get('name');

            if (isFolder === "true") {
                console.log("Item ID is " + itemID);

                // add to history (recent folders visited)
                state.addFolderToRecentFolders(itemID);

                state.setCurrentFolderID(itemID);
                state.setCurrentFolderName(itemName);

                this.set("currentFolderId", itemID);

                var previousBreadCrumb = state.getCurrentBreadCrumb();

                state.setCurrentBreadCrumb(item);

                var fileBreadCrumbs = state.getCurrentFileBreadcrumbs();

                fileBreadCrumbs.push(previousBreadCrumb);

                state.setCurrentFileBreadcrumbs(fileBreadCrumbs);

                // console.log("State toString " + state.toString());
                this.set("currentBreadCrumb", state.getCurrentBreadCrumb());
                this.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs());


                this.store.find('folder', itemID).then(function(folder) {
                    // console.log(JSON.stringify(folder));

                    //   console.log(folder.get('parentId').toString());

                    myController.set("parentId", folder.get('parentId'));

                    state.setCurrentParentId(folder.get('parentId'));
                    state.setCurrentParentType(folder.get('parentCollection'));

                    var folderContents = myController.store.query('folder', { parentId: itemID, parentType: "folder" });
                    var itemContents = myController.store.query('item', { folderId: itemID });

                    var newModel = { 'folderContents': folderContents, 'itemContents': itemContents };

                    myController.set("fileData", newModel);

                    // console.log("State toString " + state.toString());

                });

            } else {
                myController.transitionToRoute('upload.view', item);
            }
        },

        breadcrumbClicked: function(item) {
            var state = this.get('internalState');
            var crumbs = state.getCurrentFileBreadcrumbs();

            //    console.log("Breadcrumb clicked on item ");
            //    console.log(item);

            var previousItem = null;
            var newCrumbs = [];
            for (var i; i < crumbs.length; ++i) {
                if (crumbs[i].name === item.get('name'))
                    break;
                else {
                    newCrumbs.append(crumbs[i]);
                    previousItem = crumbs[i];
                }
            }

            //      console.log(newCrumbs);

            state.setCurrentFileBreadcrumbs(newCrumbs);
            state.setCurrentFolderID(item._id);
            state.setCurrentFolderName(item.name);
            state.setCurrentBreadCrumb(previousItem); // need to set this because itemClicked is expecting the previous breadcrumb.

            this.set('currentFolderId', item._id);

            this.send('itemClicked', Ember.Object.create(item), "true");
        },
        selectUpload() {
            Ember.$('.nice.upload.hidden').click();
        },
        openModal(modalName) {
            let modal = Ember.$('.ui.' + modalName + '.modal');
            modal.parent().prependTo(Ember.$(document.body));
            modal.modal('show');
        },
        insertNewFolder(folder) {
            let parentId = folder.get('parentId');
            let parentType = folder.get('parentCollection');

            let folderContents = this.store.query('folder', { parentId: parentId, parentType: parentType });
            let itemContents = this.fileData.itemContents;
            let collections = this.fileData.collections;
            let newModel = { 'folderContents': folderContents, 'itemContents': itemContents, 'collections': collections };
            this.set('fileData', newModel);
        }
    }
});