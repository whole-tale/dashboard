import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce, later, cancel } from '@ember/runloop';
import EmberObject, { computed, observer } from '@ember/object';
import { A } from '@ember/array';
import { not, alias } from '@ember/object/computed';
import $ from 'jquery';
import layout from './template';

const O = EmberObject.create.bind(EmberObject);

/**
 * Responsible for the run page view. It contains logic for
 * tale exporting and publishing.
 *
 * @class RunLeftPanelComponent
*/
export default Component.extend(FullScreenMixin, {
    layout,
    classNames: ['run-left-panel'],
    router: service(),
    internalState: service(),
    store: service(),
    apiCall: service('api-call'),
    dataoneAuth: service('dataone-auth'),
    tokenHandler: service('token-handler'),
    loadError: false,
    model: null,
    disableStartStop: false,
    taleTransitioning: false,
    contingencyTimeoutMs: 30000,
    wholeTaleHost: config.wholeTaleHost,
    hasSelectedTaleInstance: false,
    displayTaleInstanceMenu: false,
    workspaceRootId: undefined,
    session: O({dataSet:A()}),
    routing: service('-routing'),
    params: alias('routing.router.currentState.routerJsState.fullQueryParams'),
    // An array of repositories to list in the dropdown and their matching url
    repositories: [],
    // The repository that is currently selected in the dropdown
    selectedRepository: '',
  
    instancePoller: observer('model', 'model.instance', function() {
      // If we see an instance that is "Launching", poll until it completes
      const model = this.get('model')
      if (model) {
        const instance = model.get('instance');
        if (instance && instance.get('status') === 0) {
          this.apiCall.waitForInstance(model.instance);
        }
      }
    }),
    
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

    /**
     * Similar to Jquery on page load doesn't work
     * because of the handlebars. But even if you unhide the element,
     * the iframes show that they load ok even though some are blocked and some are not.
     *
     * @method didRender
    */
    didRender() {
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

  
    /**
     * Used to check for the ?auth=true query parameter and potentially
     * open the publish modal
     *
     * @method didInsertElement
    */
    didInsertElement() {
        scheduleOnce('afterRender', this, () => {
          // Check if we're coming from an ORCID redirect
          let queryParams = this.get('params')
          if (queryParams) {
            if (queryParams.auth === 'true') {
              this.router.transitionTo({ queryParams: { auth: null }});
              this.get('store').findRecord('tale', this.model.taleId, {
                reload: true
              })
              .then(resp => {
                this.send('openPublishModal', resp)
              });
            }
          }
        }); 
       $('.ui.accordion').accordion({});
    },

    /**
     * Handles querying the backend for the publishing job status and updating
     * the progress bar.
     *
     * @method handlePublishingStatus
     * @param tale The Tale that is being published
     * @param joId The ID of the job that is responsible for publishing
    */
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
                    self.set('progressTotal', job.progress.total);
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
                  if (job.progress) {
                    self.set('progress', job.progress.current);
                    self.set('progressTotal', job.progress.total);
                  } else {
                    self.set('progress', 100);
                    self.set('progressTotal', 100);
                  }
                  self.set('barColor', "#F83005");
                  cancel(currentLoop);
                } else {
                  // Otherwise the job is still running
                  // Update the progressbar
                  if (job.progress) {
                    self.set('progress', job.progress.current);
                    self.set('progressTotal', job.progress.total);
                    self.set('statusMessage', job.progress.message);
                  }
                }
              });
          }, 1000);
        };
        //Start polling
        currentLoop = startLooping();
    },

    /**
     * Retrieves a human readable error from job/result
     * 
     * @method setErrorStatus
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

    /**
     * Resets the state of the publish modal properties
     *
     * @method resetPublishState
    */
    resetPublishState() {
        this.set('progress', null);
        this.set('statusMessage', null);
        this.set('taleToPublish', null);
        this.set('publishStatus', 'initialized');
        this.set('progress', 0);
        
        let adapterOptions = {};
        return this.store.query('repository', adapterOptions).then(repos => {
          this.set('repositories', A(repos));
          if (repos.length > 0) {
            this.set('selectedRepository', this.get('repositories')[0]);
          } else {
            this.set('selectedRepository', null);
          }
        });
    },

    actions: {
        stop() {
            this.set('model', null);
        },
        
        gotoSettings() {
            const self = this;
            self.actions.closeNeedAuthModal.call(self);
            self.actions.closePublishModal.call(self);
            self.router.transitionTo('settings');
        },
        
        // Calls PUT /instance/:id as a noop to restart the instance
        restartInstance(instance) {
            this.get('apiCall').restartInstance(instance);
        },
        
        rebuildTale(taleId) {
            this.get('apiCall').rebuildTale(taleId);
        },
    
        openCopyOnLaunchModal(taleToCopy) {
          const component = this;
          $('#copy-on-launch-modal').modal('show');
          component.set('taleToCopy', taleToCopy);
        },
        
        startTale(tale) {
            const self = this;
            if (!tale) {
                console.log('Invalid tale', tale);
            } else if (tale._accessLevel < 1) {
              // Prompt for confirmation before copying and launching
              self.actions.openCopyOnLaunchModal.call(self, tale);
              return;
            }
            
            // Disable "Start" button - re-enable after a delay?
            // FIXME: API should handle this case by transitioning Instance state
            self.set('taleTransitioning', true);
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
                            self.set('disableStartStop', false);
                            self.set('taleTransitioning', false);
                            console.log('Error waiting for Tale to start:', error);
                        }).finally(() => {
                            self.set('disableStartStop', false);
                            self.set('taleTransitioning', false);
                        });
                }).catch((error) => {
                    self.set("taleLaunchError", error.message);
                    self.set('disableStartStop', false);
                    self.set('taleTransitioning', false);
                    console.log('Error starting tale:', error);
                });
        },
        
        stopTale(tale) {
            const self = this;
            
            // Disable "Stop" button - re-enable after a delay
            // FIXME: API should handle this case by transitioning Instance state
            self.set('taleTransitioning', true);
            self.set('disableStartStop', true);
            
            console.log('Stopping Tale:', tale);
            return this.get('apiCall').stopTale(tale)
                .then(response => {
                    console.log('Tale instance stopped!');
                    tale.set('instance', null);
                    later(() => {
                      self.set('disableStartStop', false);
                      self.set('taleTransitioning', false);
                    }, 6000);
                }).catch((error) => {
                    // deal with the failure here
                    self.set("error_msg", error.message);
                    console.log('Error stopping tale:', error);
                    self.set('disableStartStop', false);
                    self.set('taleTransitioning', false);
                });
        },
        
        transitionToBrowse() {
            this.router.transitionTo('browse');
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

        /**
         * Opens the publishing modal and sets initial state.
         *
         * @method openPublishModal
        */
        openPublishModal() {
          this.resetPublishState().then(resp => {
            // Check for repositories
            const repos = this.get('repositories');
            if (repos.length > 0) {
              // Open Publish modal
              const self = this;
              $('#publish-modal').modal({ 
                  onApprove: () => false,
                  onDeny: () => false,
                  onVisible: () => { 
                      self.set('selectedRepository', self.get('repositories')[0]);
                  }
              }).modal('show');
            } else {
              // Open "Connect account" modal, prompting user to go to Settings
              $('#dataone-auth-modal').modal('show');
            }
          });
        },
        
        /**
         * Retrieves the user's JWT, handles routing to ORCID if needed, and
         * sends relevant information to the backend to start publishing,
         *
         * @method submitPublish
        */
        submitPublish() {
            const self = this;

            let selection = this.selectedRepository;

            self.set('publishStatus', 'in_progress');
            self.set('progress', 0);
            const tale = self.get('model');

            // Call the publish endpoint
            self.get("apiCall").publishTale(tale._id, selection.repository)
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
        
        /**
         * Closes the publishing modal and resets the state so that the user
         * sees a fresh state when it's re-opened
         *
         * @method closePublishModal
        */
        closePublishModal() {
            $('#publish-modal').modal('hide');
            this.resetPublishState();
        },
        
        /**
         * Closes the "Users needs to auth" modal
         *
         * @method closeNeedAuthModal
        */
        closeNeedAuthModal() {
            $('#dataone-auth-modal').modal('hide');
        },

        /**
         * Called when the user selects a repository in the dropdown menu.
         *
         * @method onRepositoryChange
        */
        onRepositoryChange: function () {
          let repositoryName = $('.repository.selection.dropdown.ui.dropdown').dropdown('get text');
          let selection = this.get('repositories').find((repo) => repo.name === repositoryName);
          if (selection) {
            this.set('selectedRepository', selection);
          } else {
            console.error('Failed to select '+ repositoryName + ' for publishing');
          }
        },
    }
});
