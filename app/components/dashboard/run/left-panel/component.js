import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce, later, cancel } from '@ember/runloop';
import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { not } from '@ember/object/computed';
import $ from 'jquery';
import layout from './template';

const O = EmberObject.create.bind(EmberObject);

export default Component.extend(FullScreenMixin, {
    layout,
    classNames: ['run-left-panel'],
    router: service(),
    internalState: service(),
    apiCall: service('api-call'),
    dataoneAuth: service('dataone-auth'),
    dataoneJWT: null,
    tokenHandler: service('token-handler'),
    loadError: false,
    model: null,
    disableStartStop: false,
    contingencyTimeoutMs: 30000,
    wholeTaleHost: config.wholeTaleHost,
    hasSelectedTaleInstance: false,
    displayTaleInstanceMenu: false,
    workspaceRootId: undefined,
    session: O({dataSet:A()}),

    // Holds an array of objects that the user cannot be exclude from their package
    nonOptionalFile: [
      'manifest.json',
      'environment.json',
      'LICENSE',
      'README.md',
      'metadata.xml'
    ],

    // An array of repositories to list in the dropdown and their matching url
    repositories: [{
      name: 'DataONE Development',
      url: 'https://dev.nceas.ucsb.edu/knb/d1/mn'
    },
    {
      name: 'DataONE-The Knowledge Network for Biocomplexity',
      url: 'https://knb.ecoinformatics.org/knb/d1/mn'
    },
    {
      name: 'DataONE-Arctic Data Center',
      url: 'https://arcticdata.io/metacat/d1/mn'
    }],
    
    repoDropdownClass: computed('publishStatus', function() {
        let status = this.publishStatus;
        return (status === 'in_progress' || status === 'success') 
            ? "repository fluid selection dropdown disabled"
            : "repository fluid selection dropdown";
    }),

    init() {
        this._super(...arguments);
        let state = this.get('internalState');
        let shouldButtonsAppear = state.currentInstanceId;
        if (shouldButtonsAppear) {
            this.set('hasSelectedTaleInstance', true);
        } else {
            this.set('hasSelectedTaleInstance', false);
        }
        let controller = this;
        let apiCallService = this.get('apiCall');
        let success = (folderId) => {
            state.set('workspaceRootId', folderId);
            controller.set('workspaceRootId', folderId);
        };
        let failure = () => controller.set('workspaceRootId', undefined);
        apiCallService.getWorkspaceRootId(success, failure);
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
            const modalDialogName = 'ui/files/republish-modal';
            this.showModal(modalDialogName, this.get('modalContext'));
            this.createTooltips();
        });
        
        $('.ui.accordion').accordion({});
    },

    /*
        Return s the DataONE `token` endpoint for the jwt. When a user signs into
        DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
        found, then the response will be empty. Otherwise the jwt is returned.
    */
    getDataONEJWT() {

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

    hasD1JWT: computed('model', 'model._id', function () {
        let jwt = this.getDataONEJWT();
        return (jwt && jwt.length) ? true : false;
    }),

    showModal(modalDialogName, modalContext) {
        // Open Publish Modal
        this.sendAction('publishTale', modalDialogName, modalContext);
    },

    publishModalContext: computed('model._id', function () {
        return { taleId: this.get('model._id'), hasD1JWT: this.dataoneAuth.hasD1JWT() };
    }),


    /**
     * Creates the tooltips that appear in the dialog
     * 
     * @method createTooltips
     */
    createTooltips() {
        console.log('Creating tooltips...');
        
        // Create the popup in the main title
        $('.info.circle.blue.icon.main').popup({
          position: 'right center',
          target: '.info.circle.blue.icon.main',
          hoverable: true,
          html: "Get a citeable DOI by publishing your Tale on <a href='https://www.dataone.org/' target='_blank'>DataONE.</a> " +
                "For more information on how to publish and cite your tale, visit the " +
                "<a href='https://wholetale.readthedocs.io/en/stable/users_guide/publishing.html' target='_blank'>publishing guide</a>."
        });
    
        // Create the popups for the environment files. Files with an extension
        // need to have the period escaped with a double backslash when referencing.
        // Create the manifest.json popup
        $('.info.circle.blue.icon.manifest\\.json').popup({
          position: 'right center',
          target: '.info.circle.blue.icon.manifest\\.json',
          hoverable: true,
          html: "This file holds metadata about the tale, such as script execution order and file structure."
        });
        // Create the environment.json popup
        $('.info.circle.blue.icon.environment\\.json').popup({
          position: 'right center',
          target: '.info.circle.blue.icon.environment\\.json',
          hoverable: true,
          html: "This environment file holds the information needed to re-create the tale's base virtual machine."
        });
        // Create the LICENSE popup
        $('.info.circle.blue.icon.LICENSE').popup({
          position: 'right center',
          target: '.info.circle.blue.icon.LICENSE',
          hoverable: true,
          html: "The Tale's license is included in the package. This can be selected from the Tale's metadata view."
        });
        // Create the README.md popup
        $('.info.circle.blue.icon.README\\.md').popup({
          position: 'right center',
          target: '.info.circle.blue.icon.README\\.md',
          hoverable: true,
          html: "The Tale's README is included in the package. The README includes instructions for how to use and run the published analysis encapsulated by your Tale."
        });
        // Create the metadata.xml popup
        $('.info.circle.blue.icon.metadata\\.xml').popup({
          position: 'right center',
          target: '.info.circle.blue.icon.metadata\\.xml',
          hoverable: true,
          html: "The contents of each package are described using the Ecological Metadata Language (EML). " +
                 "To learn more about EML, visit the " +
                 "<a href='https://esajournals.onlinelibrary.wiley.com/doi/abs/10.1890/0012-9623%282005%2986%5B158%3AMTVOED%5D2.0.CO%3B2'" +
                 "target='_blank'>EML primer</a>."
        });
    },
    
    getRepositoryPathFromName(name) {
        // Given a repository name, find the membernode URL
        let repositoryList = this.get('repositories');
        for (var i = 0; i < repositoryList.length; i++) {
          if (repositoryList[i].name === name) {
            return repositoryList[i].url;
          }
        }
    },
    
    handlePublishingStatus(tale, jobId) {
        let self = this;
        let currentLoop = null;
        // Poll the status of the instance every second using recursive iteration
        let startLooping = function (func) {
    
          return later(function () {
            currentLoop = startLooping(func);
            
            const store = self.get('model').get('store');
            store.findRecord('job', jobId, {
                reload: true
              }).then(job => {
                if (job.get('status') === 3) {
                  if (job.progress) {
                    self.set('progress', job.progress.current);
                    self.set('statusMessage', job.progress.message);
                  }
                  self.set('publishStatus', 'success');
                  // The Tale was changed by the job, so fetch it again
                  store.findRecord('tale', tale._id, {
                      reload: true
                    })
                    .then(resp => {
                      // Update UI with Tale information
                      self.set('tale', resp);
                      self.set('packageIdentifier', resp.publishInfo.slice(-1).pop().pid);
                      self.set('packageURL', resp.publishInfo.slice(-1).pop().uri);
                      cancel(currentLoop);
                    });
                } else if (job.get('status') === 4) {
                  // Then the job failed with an error
                  self.setErrorStatus(job._id)
                  self.set('progress', 100)
                  self.set('barColor', "#F83005");
                  cancel(currentLoop);
                } else {
                  // Otherwise the job is still running
                  // Update the progressbar
                  if (job.progress) {
                    self.set('progress', job.progress.current);
                    self.set('statusMessage', job.progress.message);
                  }
                }
              });
          }, 1000);
        };
        //Start polling
        currentLoop = startLooping();
    },

    /* 
     * Retrieves a human readable error from job/result
     * 
     * @method closeModal
     */
    setErrorStatus(jobId) {
        const self = this;
        let onGetJobStatusSuccess = (message) => {
          self.set('statusMessage', message);
        };
    
        self.set('publishStatus', 'error');
        return self.apiCall.getFinalJobStatus(jobId)
            .then(onGetJobStatusSuccess)
            .catch(onGetJobStatusSuccess);
    },
        
    resetPublishState() {
        // Reset any leftover previous state
        this.set('progress', null);
        this.set('statusMessage', null);
        this.set('taleToPublish', null);
        this.set('publishStatus', 'initialized');
        this.set('progress', 0);
    },

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
        
        startTale(tale) {
            const self = this;
            if (!tale) {
                console.log('Invalid tale', tale);
            }
            
            // Disable "Start" button - re-enable after a delay?
            // FIXME: API should handle this case by transitioning Instance state
            self.set('disableStartStop', true);
            let contingency = later(() => self.set('disableStartStop', false), self.contingencyTimeoutMs);
            
            console.log('Starting Tale:', tale);
            return this.get('apiCall').startTale(tale)
                .then((instance) => {
                    tale.set("instance", instance);
                    this.get('apiCall').waitForInstance(instance)
                        .then((instance) => {
                            tale.set("instance", instance);
                            self.get('taleLaunched')();
                            console.log('Tale instance started!');
                            cancel(contingency);
                        }).catch((error) => {
                            self.set("taleLaunchError", error.message);
                            console.log('Error starting tale:', error);
                        }).finally(() => self.set('disableStartStop', false));
                })
        },
        
        stopTale(tale) {
            const self = this;
            if (!tale) {
                console.log('Invalid tale', tale);
            }
            
            // Disable "Stop" button - re-enable after a delay
            // FIXME: API should handle this case by transitioning Instance state
            self.set('disableStartStop', true);
            let contingency = later(() => self.set('disableStartStop', false), self.contingencyTimeoutMs);
            
            console.log('Stopping Tale:', tale);
            return this.get('apiCall').stopTale(tale)
                .then(response => {
                    tale.set('instance', null);
                    console.log('Tale instance stopped!');
                    cancel(contingency);
                }).catch((error) => {
                    // deal with the failure here
                    //self.set("tale_instantiating", false);
                    //self.set("tale_not_instantiated", true);
            
                    self.set("error_msg", error.message);
                    console.log('Error starting tale:', error);
                  }).finally(() => self.set('disableStartStop', false));
        },
        
        transitionToBrowse() {
            this.router.transitionTo('browse');
        },

        publishTale(modalDialogName, modalContext) {
            // Open Modal
            this.get('showModal')(modalDialogName, modalContext);
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
        
        exportTale(id, format) {
          const token = this.get('tokenHandler').getWholeTaleAuthToken();
          let url = `${config.apiUrl}/tale/${id}/export`;
          window.location.assign(url + '?token=' + token + '&taleFormat=' + format);
        },
        
        openPublishModal(tale) {
            const jwt = this.getDataONEJWT();
            if (!jwt) {
                // reroute to auth
                $('#dataone-auth-modal').modal('show');
                return;
            }
            
            this.set('dataoneJWT', jwt);
            this.resetPublishState();
            this.set('taleToPublish', tale);
            this.set('selectedRepository', null);
            const self = this;
            $('#publish-modal').modal({ 
                onApprove: () => false,
                onDeny: () => false,
                onVisible: () => { self.set('selectedRepository', self.get('repositories')[0].name); }
            }).modal('show');
        },
        

        submitPublish(tale) {
            const self = this;
            console.log('Now publishing:', tale);
            self.set('publishStatus', 'in_progress');
            self.set('progress', 0);
            const targetRepo = self.get('selectedRepository');
            const repository = self.getRepositoryPathFromName(targetRepo);
            const dataOneJWT = this.get('dataoneJWT');
            
            // Call the publish endpoint
            self.get("apiCall").publishTale(tale._id, repository, dataOneJWT)
                .then((publishJob) => {
                    console.log('Submitted for publish:', publishJob);
                    self.set('publishStatus', 'in_progress');
                    // Poll the job queue for the status of the job
                    self.set('progress', 1);
                    self.set('statusMessage', 'Initializing publish job...');
                    self.handlePublishingStatus(tale, publishJob._id);
                })
                .catch((err) => {
                    console.log('Failed to publish:', err);
                    self.set('publishStatus', 'error');
                    if (err && err.message) {
                        self.set('statusMessage', err.message);
                    }
                });
                
            return false;
        },
        
        closePublishModal() {
            $('#publish-modal').modal('hide');
            this.resetPublishState();
        },
        
        onRepositoryChange: function () {
          // Called when the user changes the repository
          let respText = $('.repository.selection.dropdown.ui.dropdown').dropdown('get text')
          this.set('selectedRepository', respText);
        },
    }
});
