import TextField from '@ember/component/text-field';
import Component from '@ember/component';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import Object, { observer, computed } from '@ember/object';
import $ from 'jquery';

const O = Object.create.bind(Object);

function wrapFolder(folderID, folderName) {
    return {
        'name': folderName,
        'id': folderID,
        'isFolder': true,

        get(name) {
            if (name === 'name') return folderName;
            else if (name === 'id') return folderID;
            else return null;
        }
    };
}

TextField.reopen({
    attributeBindings: ['multiple']
});

export default Component.extend({
    model: null,
    classNames: ['tale-tab-files'],
    internalState: service(),
    store: service(),
    folderNavs: service(),
    router: service(),
    apiCall: service('api-call'),

    fileBreadCrumbs: computed(function () {
        return {};
    }),
    currentBreadCrumb: computed(function () {
        return [];
    }),
    currentNav: computed(function () {
        return {};
    }),
    currentNavCommand: 'home',
    currentNavTitle: 'Home',
    parentId: null,
    file: '',

    fileChosen: observer('file', function () {
        if (this.get('file') === '') return;
        let uploader = $('.nice.upload.hidden');
        let files = uploader[0].files;
        let dz = window.Dropzone.forElement('.dropzone');
        for (let i = 0; i < files.length; i++) {
            dz.addFile(files[i]);
        }
        this.set('file', '');
    }),

    init() {
        this._super(...arguments);
        let state = this.get('internalState');

        state.setCurrentBreadCrumb(null);
        state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
        state.setCurrentFolderName('');

        this.set('currentBreadCrumb', null);
        this.set('fileBreadCrumbs', []);

        this.set('fileData', this.model);
        this.set('currentFolderId', state.getCurrentFolderID());

        this.get('folderNavs').getCurrentFolderNavAndSetOn(this);

        let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();
        if (!(fileBreadCrumbs && fileBreadCrumbs.length)) {
            fileBreadCrumbs = [];
            state.setCurrentFileBreadcrumbs(fileBreadCrumbs); // new collection, reset crumbs
        }

        if (state.getCurrentParentType() !== 'user') {
            let bc = wrapFolder(state.getCurrentFolderID(), state.getCurrentFolderName());
            this.set('currentBreadCrumb', bc);
            state.setCurrentBreadCrumb(bc);
        }

        this.set('fileBreadCrumbs', state.getCurrentFileBreadcrumbs()); // new collection, reset crumbs

    },

    actions: {
        refresh() {
            let state = this.get('internalState');
            let myController = this;
            let itemID = state.getCurrentFolderID();

            let folderContents = myController.store.query('folder', {
                parentId: itemID,
                parentType: 'folder',
                reload: true,
                adapterOptions: {
                    queryParams: {
                        limit: '0'
                    }
                }
            });

            let itemContents = myController.store.query('item', {
                folderId: itemID,
                reload: true,
                adapterOptions: {
                    queryParams: {
                        limit: '0'
                    }
                }
            });

            let newModel = {
                'folderContents': folderContents,
                'itemContents': itemContents
            };

            myController.set('fileData', newModel);
        },

        //----------------------------------------------------------------------------
        navClicked(nav) {
            let controller = this;
            let state = this.get('internalState');

            let folderContents = null;
            let itemContents = null;

            state.setCurrentNavCommand(nav.command);
            this.set('currentNav', nav);
            this.set('currentNavCommand', nav.command);
            this.set('currentNavTitle', nav.name);

            if (nav.command === 'workspace') {
                // gather necessary data before querying folders
                let workspaceRootId = state.workspaceRootId;
                // the model is the instance, which has a reference
                // to the taleId from which it was spun
                let taleId = this.get('model.taleId'); // state.currentInstanceId;
                folderContents = controller.get('store').query('folder', {
                    parentId: workspaceRootId,
                    parentType: 'folder',
                    name: taleId,
                    adapterOptions: {
                        queryParams: {
                            limit: '0'
                        }
                    }
                }).then(folders => {
                    if (folders.length) {
                        let folder_id = folders.content[0].id;
                        state.setCurrentFolderID(folder_id);
                        state.setCurrentParentId(workspaceRootId/*nav.parentId*/);
                        state.setCurrentParentType('folder'/*nav.parentType*/);
                        state.setCurrentFolderName(nav.name);
                        controller.set('currentFolderId', folder_id);

                        itemContents = controller.store.query('item', {
                            folderId: folder_id,
                            reload: true,
                            adapterOptions: {
                                queryParams: {
                                    limit: '0'
                                }
                            }
                        });
                        return controller.store.query('folder', {
                            'parentId': folder_id,
                            'parentType': 'folder'
                        });
                    }
                    throw new Error(nav.name + ' folder not found for this tale.');
                }).catch(() => {
                    return;
                });
            } else if (nav.command === 'home') {
                folderContents = controller.get('store').query('folder', {
                    parentId: nav.parentId,
                    parentType: nav.parentType,
                    name: nav.name,
                    reload: true,
                    adapterOptions: {
                        queryParams: {
                            limit: '0'
                        }
                    }
                }).then(folders => {
                    if (folders.length) {
                        let folder_id = folders.content[0].id;

                        state.setCurrentFolderID(folder_id);
                        state.setCurrentParentId(nav.parentId);
                        state.setCurrentParentType(nav.parentType);
                        state.setCurrentFolderName(nav.name);
                        controller.set('currentFolderId', folder_id);

                        itemContents = controller.store.query('item', {
                            folderId: folder_id,
                            reload: true,
                            adapterOptions: {
                                queryParams: {
                                    limit: '0'
                                }
                            }
                        });
                        return controller.store.query('folder', {
                            'parentId': folder_id,
                            'parentType': 'folder'
                        });
                    }
                    throw new Error(nav.name + ' folder not found.');
                }).catch(() => {
                    return;
                });
            } else if (nav.command === 'recent') {
                let uniqueSetOfRecentFolders = [];
                let recentFolders = state.getRecentFolders().filter(folder => {
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
                let payload = JSON.stringify({
                    'folder': recentFolders
                });
                folderContents = controller.get('store').query('resource', {
                    'resources': payload
                });
                // alert('Not implemented yet ...');
            } else if (nav.command === 'user_data') {
                let sessionId = controller.model.get('sessionId');
                let sessionContents = controller.get('store').findRecord('dm', sessionId, { adapterOptions: { insertPath: 'session' }})
                    .then(session => {
                        return session.get('dataSet').map(item => {
                            let { itemId, mountPath } = item;
                            return { id: itemId, name: mountPath };
                        });
                    });
                itemContents = Promise.resolve(A([]));
                folderContents = sessionContents.then(_sessionContents => {
                    newModel.sessionContents = _sessionContents;
                    return A();
                });
                // alert("Not implemented yet ...");
            } else if (nav.command === "user_data") {
              let session, sessionId = controller.model.get('sessionId');
              let sessionContents = controller.get('store').findRecord('dm', sessionId, { adapterOptions: { insertPath: 'session' }})
                .then(_session => {
                  session = _session;
                  return session.get('dataSet').map(item => {
                    let {itemId, mountPath} = item;
                    return O({id: itemId, name: mountPath.replace(/\//g, '') });
                  });
                })
              ;
              itemContents = Promise.resolve(A([]));
              folderContents = sessionContents.then(_sessionContents => {
                newModel.sessionContents = _sessionContents;
                controller.set('session', session);
                return A();
              });
            }

            let newModel = {};
            if(folderContents.then) {
                folderContents.then(_folderContents => {
                    newModel.folderContents = _folderContents;
                    return itemContents;
                })
                .then(_itemContents => {
                    newModel.itemContents = _itemContents;
                })
                .finally(() => {
                    controller.set('fileData', newModel);
                });
            }
            state.setCurrentBreadCrumb(null);
            state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
            state.setCurrentFolderName('');
            this.set('currentBreadCrumb', null);
            this.set('fileBreadCrumbs', []);
        },

        //----------------------------------------------------------------------------
        itemClicked: function (item, isFolder) {
            let state = this.get('internalState');
            let myController = this;

            let itemID = item.get('_id');
            let itemName = item.get('name');

            if (isFolder === 'true') {
                this.store.find('folder', itemID).then(function (folder) {
                    myController.set('parentId', folder.get('parentId'));

                    state.setCurrentParentId(folder.get('parentId'));
                    state.setCurrentParentType(folder.get('parentCollection'));

                    let folderContents, itemContents;
                    try {
                        folderContents = myController.store.query('folder', {
                            parentId: itemID,
                            parentType: 'folder'
                        });
                        itemContents = myController.store.query('item', {
                            folderId: itemID
                        });

                        let newModel = {
                            'folderContents': folderContents,
                            'itemContents': itemContents
                        };
                        myController.set('fileData', newModel);
                    } catch (e) {
                        // TODO(Adam): better handle this somehow. for now I just log a message
                    }
                    // add to history (recent folders visited)

                    // NOTE(Adam): The following code was moved into the 'find folder .then' clause. We need this here
                    //             to make sure we only update breadcrumbs after successfully navigating into the folder.
                    state.addFolderToRecentFolders(itemID);

                    state.setCurrentFolderID(itemID);
                    state.setCurrentFolderName(itemName);

                    myController.set('currentFolderId', itemID);

                    let previousBreadCrumb = state.getCurrentBreadCrumb();

                    state.setCurrentBreadCrumb(item);

                    let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();

                    if (previousBreadCrumb) { // NOTE(Adam): prevent from pushing a null value into the array
                        fileBreadCrumbs.push(previousBreadCrumb);
                    }

                    state.setCurrentFileBreadcrumbs(fileBreadCrumbs);

                    myController.set('currentBreadCrumb', state.getCurrentBreadCrumb());
                    myController.set('fileBreadCrumbs', state.getCurrentFileBreadcrumbs());
                });

            } /* else {
                // myController.get('router').transitionTo('upload.view', item.get('id'));
            } */
        },

        breadcrumbClicked: function (item) {
            let state = this.get('internalState');
            let crumbs = state.getCurrentFileBreadcrumbs();

            let previousItem = null;
            let newCrumbs = [];
            for (let i; i < crumbs.length; ++i) {
                if (crumbs[i].name === item.get('name'))
                    break;
                else {
                    newCrumbs.append(crumbs[i]);
                    previousItem = crumbs[i];
                }
            }

            state.setCurrentFileBreadcrumbs(newCrumbs);
            state.setCurrentFolderID(item._id);
            state.setCurrentFolderName(item.name);
            state.setCurrentBreadCrumb(previousItem); // need to set this because itemClicked is expecting the previous breadcrumb.

            this.set('currentFolderId', item._id);

            this.send('itemClicked', Object.create(item), 'true');
        },

        //----------------------------------------------------------------------------
        openUploadDialog() {
            $('.nice.upload.hidden').click();
        },

        //----------------------------------------------------------------------------
        openModal(modalName) {
            let modal = $('.ui.' + modalName + '.modal');
            modal.parent().prependTo($(document.body));
            modal.modal('show');
        },

        //----------------------------------------------------------------------------
        insertNewFolder(folder) {
            let parentId = folder.get('parentId');
            let parentType = folder.get('parentCollection');

            let folderContents = this.store.query('folder', {
                parentId: parentId,
                parentType: parentType
            });
            let itemContents = this.fileData.itemContents;
            let collections = this.fileData.collections;
            let newModel = {
                'folderContents': folderContents,
                'itemContents': itemContents,
                'collections': collections
            };
            this.set('fileData', newModel);
        },

        //-----------------------------------------------------------------------------
        openCreateFolderModal() {
            // NOTE(Adam): Certain Semantic UI components depends heavily on jquery to work properly. The Modal component is one such component
            //             , and although its bad practice to include jquery, it is needed here until we can
            //             replace Semantic UI Modals with something else.
            // (see: https://semantic-org.github.io/Semantic-UI-Ember/#/modules/modal)

            $('.ui.modal.newfolder').modal('show');
        },

        //-----------------------------------------------------------------------------
        openRegisterModal() {
            $('.ui.modal.harvester').modal('show');
        },
        updateSessionData(listOfSelectedItems) {
            // console.log('updating session data...');
            // NOTE: Structure of the list looks like this:

            /*
              [
                {
                  'id': '59aeb3f246a83d0001ab6777',
                  'name': 'us85co.xls',
                  '_modelType': 'item'
                },
                {
                  'id': '59aeb3f246a83d0001ab6775',
                  'name': 'usco2000.xls',
                  '_modelType': 'item'
                },
                {
                  'id': '59aeb3f246a83d0001ab677b',
                  'name': 'datadict2005.html',
                  '_modelType': 'item'
                }
              ]
            */

            // do something with selected items here ...
        },
        openSelectDataModal() {
            this.sendAction('openSelectDataModal');
        },
        closeSelectDataModal() {
            $('.ui.modal.selectdata').modal('hide');
        },
        updateWorkspaceData(listOfSelectedItems) {
            console.log('updating workspace data...');
            // NOTE: Structure of the list looks like this:

            /*
              [
                {
                  'id': '59aeb3f246a83d0001ab6777',
                  'name': 'us85co.xls',
                  '_modelType': 'item'
                },
                {
                  'id': '59aeb3f246a83d0001ab6775',
                  'name': 'usco2000.xls',
                  '_modelType': 'item'
                },
                {
                  'id': '59aeb3f246a83d0001ab677b',
                  'name': 'datadict2005.html',
                  '_modelType': 'item'
                }
              ]
            */

            // do something with selected items here ...
        },
        openWorkspacesDataModal() {
            $('.ui.modal.workspacedata').modal('show');
        },
        closeWorkspacesDataModal() {
            $('.ui.modal.workspacedata').modal('hide');
        }
    }
});
