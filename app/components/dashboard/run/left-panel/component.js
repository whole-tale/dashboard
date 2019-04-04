import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce } from '@ember/runloop';
import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { not } from '@ember/object/computed';
import $ from 'jquery';
import layout from './template';

const O = EmberObject.create.bind(EmberObject);

export default Component.extend(FullScreenMixin, {
    layout,
    classNames: ['run-left-panel'],
    router: service('-routing'),
    internalState: service(),
    apiCall: service('api-call'),
    dataoneAuth: service('dataone-auth'),
    tokenHandler: service('token-handler'),
    loadError: false,
    model: null,
    wholeTaleHost: config.wholeTaleHost,
    hasSelectedTaleInstance: false,
    displayTaleInstanceMenu: false,
    workspaceRootId: undefined,
    session: O({dataSet:A()}),

    init() {
        this._super(...arguments);
        let state = this.get('internalState');
        let shouldButtonsAppear = state.currentInstanceId;
        if (shouldButtonsAppear) {
            this.set('hasSelectedTaleInstance', true);
        } else {
            this.set('hasSelectedTaleInstance', false);
        }
        if(!state.workspaceRootId) {
            let controller = this;
            let apiCallService = this.get('apiCall');
            let success = (folderId) => {
                state.set('workspaceRootId', folderId);
                controller.set('workspaceRootId', folderId);
            };
            let failure = () => controller.set('workspaceRootId', undefined);
            apiCallService.getWorkspaceRootId(success, failure);
        }
        this.result = {
            CouldNotLoadUrl: 1,
            UrlLoadedButContentCannotBeAccessed: 2,
            UrlLoadedContentCanBeAccessed: 3
        };
    },

    /*didRender() {
        // Similar to Jquery on page load
        // doesn't work because of the handlebars. But even if you unhide the element, the iframes show
        // that they load ok even though some are blocked and some are not.
        let frame = document.getElementById('frontendDisplay');
        if (frame) {
            frame.onload = () => {
                
                let iframeWindow = frame.contentWindow;
                window.addEventListener("message", function (event) {
                    if (event.origin !== window.location.origin) {
                        // something from an unknown domain, let's ignore it
                        return;
                    }
                }, false);

                iframeWindow.parent.postMessage('message sent', window.location.origin);
            };
        }
        
        
    },*/

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

    actions: {
        stop() {
            this.set('model', null);
        },
        
        // Calls PUT /instance/:id as a noop to restart the instance
        restartInstance(instance) {
            this.get('apiCall').restartInstance(instance);
        },
        
        rebuildTale(taleId) {
            this.get('apiCall').rebuildTale(taleId);
        },
        
        openDataoneAuthModal() {
            $('#dataone-auth-modal').modal('show');
        },

        authenticateD1(taleId) {
            this.get('dataoneAuth').rerouteToDataoneLogin(taleId);
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
        
        exportTale(id, format) {
          const token = this.get('tokenHandler').getWholeTaleAuthToken();
          let url = `${config.apiUrl}/tale/${id}/export`;
          window.location.href = url + '?token=' + token + '&taleFormat=' + format;
        },
        
        openPublishModal() {
            const self = this;
            const jwt = self.get('dataoneAuth').getDataONEJWT();
            if (!jwt) {
                // Redirect to DataONE Auth
                self.actions.openDataoneAuthModal();
            } else {
                // Display Publish modal
                $('.ui.publish.modal').modal({ 
                    onApprove: () => false,
                    onDeny: () => false,
                }).modal('show');
            }
        },
    }
});
