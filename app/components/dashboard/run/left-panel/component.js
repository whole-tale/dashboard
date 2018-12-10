import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';
import $ from 'jquery';
import layout from './template';

export default Component.extend(FullScreenMixin, {
    layout,
    classNames: ['run-left-panel'],
    router: service('-routing'),
    internalState: service(),
    loadError: false,
    model: null,
    wholeTaleHost: config.wholeTaleHost,
    hasSelectedTaleInstance: false,
    displayTaleInstanceMenu: false,

    init() {
        this._super(...arguments);
        let shouldButtonsAppear = this.get('internalState').currentInstanceId;
        if (shouldButtonsAppear) {
            this.set('hasSelectedTaleInstance', true);
        } else {
            this.set('hasSelectedTaleInstance', false);
        }
        this.result = {
            CouldNotLoadUrl: 1,
            UrlLoadedButContentCannotBeAccessed: 2,
            UrlLoadedContentCanBeAccessed: 3
        };
    },

    didRender() {
        // Similar to Jquery on page load
        // doesn't work because of the handlebars. But even if you unhide the element, the iframes show
        // that they load ok even though some are blocked and some are not.
        let frame = document.getElementById('frontendDisplay');
        if (frame) {
            frame.onload = () => {
                let iframeWindow = frame.contentWindow;
                // let that = $(this)[0]; // commented because was never used

                window.addEventListener("message", function (event) {
                    if (event.origin !== window.location.origin) {
                        // something from an unknown domain, let's ignore it
                        return;
                    }
                }, false);

                iframeWindow.parent.postMessage('message sent', window.location.origin);
            };
        }
    },

    didInsertElement() {
        scheduleOnce('afterRender', this, () => {
            // Check if we're coming from an ORCID redirect
            // If ?auth=true
            // Open Modal
            const modalDialogName = 'ui/files/publish-modal';
            this.showModal(modalDialogName, this.get('modalContext'));
        });
    },

    getDataONEJWT() {
        /*
        Queries the DataONE `token` endpoint for the jwt. When a user signs into
        DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
        found, then the response will be empty. Otherwise the jwt is returned.
        */

        // Use the XMLHttpRequest to handle the request
        let xmlHttp = new XMLHttpRequest();
        // Open the request to the the token endpoint, which will return the jwt if logged in
        xmlHttp.open("GET", 'https://cn-stage-2.test.dataone.org/portal/token', false);
        // Set the response content type
        xmlHttp.setRequestHeader("Content-Type", "text/xml");
        // Let XMLHttpRequest know to use cookies
        xmlHttp.withCredentials = true;
        xmlHttp.send(null);
        return xmlHttp.responseText;
    },

    shouldShowButtons: computed('internalState', 'internalState.currentInstanceId', function () {
        let shouldButtonsAppear = this.get('internalState').currentInstanceId;
        if (shouldButtonsAppear) {
            this.set('hasSelectedTaleInstance', true);
        } else {
            this.set('hasSelectedTaleInstance', false);
        }
        return this.get('hasSelectedTaleInstance');
    }),

    noInstanceSelected: not('hasSelectedTaleInstance'),

    hasD1JWT: computed('model.taleId', function () {
        let jwt = this.getDataONEJWT();
        return (jwt && jwt.length) ? true : false;
    }),

    showModal(modalDialogName, modalContext) {
        // Open Publish Modal
        this.sendAction('publishTale', modalDialogName, modalContext);
    },

    publishModalContext: computed('model.taleId', function () {
        return { taleId: this.get('model.taleId'), hasD1JWT: this.hasD1JWT };
    }),

    actions: {
        stop() {
            this.set("model", null);
        },

        publishTale(modalDialogName, modalContext) {
            // Open Modal
            this.get('showModal')(modalDialogName, modalContext);
        },

        denyDataONE() {
            return true;
        },

        authenticateD1(taleId) {
            let callback = `${this.get('wholeTaleHost')}/run/${taleId}?auth=true`;
            let orcidLogin = 'https://cn-stage-2.test.dataone.org/portal/oauth?action=start&target=';
            window.location.replace(orcidLogin + callback);
        },

        openDeleteModal(id) {
            let selector = '.ui.' + id + '.modal';
            $(selector).modal('show');
        },

        approveDelete(model) {
            model.deleteRecord();
            model.save();
            this.get('router').transitionTo('run');
            return false;
        },

        denyDelete() {
            return true;
        },

        // previously was in the manage tab
        //----------------------------------------------------------------------------
        itemClicked(item, isFolder) {
            let state = this.get('internalState');
            let myController = this;

            let itemID = item.get('_id');
            let itemName = item.get('name');

            if (isFolder === "true") {
                this.store.find('folder', itemID).then(function (folder) {
                    myController.set("parentId", folder.get('parentId'));

                    state.setCurrentParentId(folder.get('parentId'));
                    state.setCurrentParentType(folder.get('parentCollection'));

                    let folderContents, itemContents;
                    try {
                        folderContents = myController.store.query('folder', {
                            parentId: itemID,
                            parentType: "folder"
                        });
                        itemContents = myController.store.query('item', {
                            folderId: itemID
                        });

                        let newModel = {
                            'folderContents': folderContents,
                            'itemContents': itemContents
                        };
                        myController.set("fileData", newModel);
                    } catch (e) {
                        // TODO(Adam): better handle this somehow. for now I just log a message
                    }
                    // add to history (recent folders visited)

                    // NOTE(Adam): The following code was moved into the "find folder .then" clause. We need this here
                    //             to make sure we only update breadcrumbs after successfully navigating into the folder.
                    state.addFolderToRecentFolders(itemID);

                    state.setCurrentFolderID(itemID);
                    state.setCurrentFolderName(itemName);

                    myController.set("currentFolderId", itemID);

                    let previousBreadCrumb = state.getCurrentBreadCrumb();

                    state.setCurrentBreadCrumb(item);

                    let fileBreadCrumbs = state.getCurrentFileBreadcrumbs();

                    if (previousBreadCrumb) { // NOTE(Adam): prevent from pushing a null value into the array
                        fileBreadCrumbs.push(previousBreadCrumb);
                    }

                    state.setCurrentFileBreadcrumbs(fileBreadCrumbs);

                    myController.set("currentBreadCrumb", state.getCurrentBreadCrumb());
                    myController.set("fileBreadCrumbs", state.getCurrentFileBreadcrumbs());
                });

            } /* else {
                // myController.get('router').transitionTo('upload.view', item.get('id'));
            } */
        },
        navClicked(nav) {
            let controller = this;
            let state = this.get('internalState');

            let folderContents = null;
            let itemContents = null;

            state.setCurrentNavCommand(nav.command);
            this.set('currentNav', nav);
            this.set("currentNavCommand", nav.command);
            this.set("currentNavTitle", nav.name);

            if (nav.command === "home" || nav.command === "user_data" || nav.command === "workspace") {
                folderContents = controller.get('store').query('folder', {
                    parentId: nav.parentId,
                    parentType: nav.parentType,
                    name: nav.name,
                    reload: true,
                    adapterOptions: {
                        queryParams: {
                            limit: "0"
                        }
                    }
                }).then(folders => {
                    if (folders.length) {
                        let folder_id = folders.content[0].id;

                        state.setCurrentFolderID(folder_id);
                        state.setCurrentParentId(nav.parentId);
                        state.setCurrentParentType(nav.parentType);
                        state.setCurrentFolderName(nav.name);
                        controller.set("currentFolderId", folder_id);

                        itemContents = controller.store.query('item', {
                            folderId: folder_id,
                            reload: true,
                            adapterOptions: {
                                queryParams: {
                                    limit: "0"
                                }
                            }
                        });
                        return controller.store.query('folder', {
                            "parentId": folder_id,
                            "parentType": "folder"
                        });
                    }
                    throw new Error(nav.name + " folder not found.");
                })
                    .catch(() => {
                        return;
                    });
            } else if (nav.command === "recent") {
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
                    "folder": recentFolders
                });
                folderContents = controller.get('store').query('resource', {
                    "resources": payload
                });
                // alert("Not implemented yet ...");
            }

            let newModel = {};
            folderContents
                .then(_folderContents => {
                    newModel.folderContents = _folderContents;
                    return itemContents;
                })
                .then(_itemContents => {
                    newModel.itemContents = _itemContents;
                })
                .finally(() => {
                    controller.set("fileData", newModel);
                });

            state.setCurrentBreadCrumb(null);
            state.setCurrentFileBreadcrumbs([]); // new nav folder, reset crumbs
            state.setCurrentFolderName("");
            this.set("currentBreadCrumb", null);
            this.set("fileBreadCrumbs", []);
        }
    }
});