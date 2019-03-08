import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce } from '@ember/runloop';
import Object, { computed } from '@ember/object';
import { A } from '@ember/array';
import { not } from '@ember/object/computed';
import $ from 'jquery';
import layout from './template';

const O = Object.create.bind(Object);

export default Component.extend(FullScreenMixin, {
    layout,
    classNames: ['run-left-panel'],
    router: service('-routing'),
    internalState: service(),
    apiCall: service('api-call'),
    tokenHandler: service('token-handler'),
    loadError: false,
    model: null,
    wholeTaleHost: config.wholeTaleHost,
    hasSelectedTaleInstance: false,
    displayTaleInstanceMenu: false,
    workspaceRootId: undefined,
    showDimmer: false,

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
        
        exportTale(id) {
          let self = this;
          // Asks the girder endpoint for a zipped Tale
          // This code was adapted from
          // https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
          const token = self.get('tokenHandler').getWholeTaleAuthToken();
          let url = `${config.apiUrl}/tale/${id}/export`;
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'arraybuffer';
          xhr.setRequestHeader("Girder-Token", token);
          self.set('showDimmer', true);
          xhr.onload = function () {
              if (this.status === 200) {
                self.set('showDimmer', false);
                  var filename = "";
                  var disposition = xhr.getResponseHeader('Content-Disposition');
                  if (disposition && disposition.indexOf('attachment') !== -1) {
                      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                      var matches = filenameRegex.exec(disposition);
                      if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                  }
                  var type = xhr.getResponseHeader('Content-Type');
    
                  var blob = typeof File === 'function'
                      ? new File([this.response], filename, { type: type })
                      : new Blob([this.response], { type: type });
                  if (typeof window.navigator.msSaveBlob !== 'undefined') {
                      // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                      window.navigator.msSaveBlob(blob, filename);
                  } else {
                      var URL = window.URL || window.webkitURL;
                      var downloadUrl = URL.createObjectURL(blob);
    
                      if (filename) {
                          // use HTML5 a[download] attribute to specify filename
                          var a = document.createElement("a");
                          // safari doesn't support this yet
                          if (typeof a.download === 'undefined') {
                              window.location = downloadUrl;
                          } else {
                              a.href = downloadUrl;
                              a.download = filename;
                              document.body.appendChild(a);
                              a.click();
                          }
                      } else {
                          window.location = downloadUrl;
                      }
    
                      setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                  }
              }
          };
          xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          xhr.send();
        }
    }
});
