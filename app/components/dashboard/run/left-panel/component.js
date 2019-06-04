import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce, later, cancel } from '@ember/runloop';
import EmberObject, { computed } from '@ember/object';
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
    // Holds an array of objects that the user cannot be exclude from their package
    nonOptionalFile: [
      'manifest.json',
      'environment.json',
      'LICENSE',
      'README.md',
      'metadata.xml'
    ],
    
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
        
        this.createTooltips();
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
              this.get('store').findRecord('tale', this.model.taleId, {
                reload: true
              })
              .then(resp => {
              this.send('openPublishModal', resp)
            })
          }
          }
        })   

        $('.ui.accordion').accordion({});
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


    showModal(modalDialogName, modalContext) {
        // Open Publish Modal
        this.sendAction('publishTale', modalDialogName, modalContext);
    },

    publishModalContext: computed('model.taleId', function () {
        return { taleId: this.get('model.taleId'), hasD1JWT: this.dataoneAuth.hasD1JWT };
    }),


    /**
     * Creates the tooltips that appear in the dialog
     * 
     * @method createTooltips
    */
    createTooltips() {
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
        this.setShownRepositories();
        this.set('selectedRepository', this.get('repositories')[0]);
    },

    /**
     * Filters the possible repositories to the ones that should
     * be shown to the user.
     * 
     * @method setShownRepositories
     */
    setShownRepositories() {

      // An array of possible repositories to publish to
      let repositories = [
        {
          name: 'DataONE Development',
          memberNode: 'https://dev.nceas.ucsb.edu/knb/d1/mn',
          coordinatingNode: 'https://cn-stage-2.test.dataone.org/cn/v2',
          isProduction: false
        },
        {
          name: 'DataONE-The Knowledge Network for Biocomplexity',
          memberNode: 'https://knb.ecoinformatics.org/knb/d1/mn',
          coordinatingNode: 'https://cn.dataone.org/cn/v2',
          isProduction: true
        },
        {
          name: 'DataONE-Arctic Data Center',
          memberNode: 'https://arcticdata.io/metacat/d1/mn',
          coordinatingNode: 'https://cn.dataone.org/cn/v2',
          isProduction: true
        }
      ];

      // An array of the repositories that we show
      let displayedRepositories = [];

      // When we're on a development deployment, only show development nodes
      if(config.dev) {
        repositories.forEach(repository => {
          if(!repository.isProduction) {
            displayedRepositories.push(repository);
          }
        })
      }
      else {
        // Otherwise show all repositories
        displayedRepositories = repositories;
      }
      this.set('repositories', displayedRepositories);

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

        publishTale(modalDialogName, modalContext) {
            // Open Modal
            this.get('showModal')(modalDialogName, modalContext);
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
         * Redirect to the selected repository's authentication portal.
         *
         * @method authenticateD1
         * @param instanceId The ID of the running instance
        */
        authenticateD1(instanceId) {
          let callback = `${this.get('wholeTaleHost')}/run/${instanceId}?auth=true`;
          let endpoint = this.dataoneAuth.getPortalEndpoint(this.selectedRepository.coordinatingNode)
          endpoint += '/oauth?action=start&target=';
          window.location.replace(endpoint + callback);
      },

        /**
         * Opens the publishing modal and sets initial state.
         *
         * @method openPublishModal
         * @param tale The Tale that is going to be published
        */
        openPublishModal(tale) {          
            this.resetPublishState();
            this.set('taleToPublish', tale);
            const self = this;
            $('#publish-modal').modal({ 
                onApprove: () => false,
                onDeny: () => false,
                onVisible: () => false,
            }).modal('show');
        },
        
        /**
         * Retrieves the user's JWT, handles routing to ORCID if needed, and
         * sends relevant information to the backend to start publishing,
         *
         * @method submitPublish
         * @param tale The Tale that is going to be published
        */
        submitPublish(tale) {
            const self = this;

            let repository = this.selectedRepository;
            let dataOneJWT = this.dataoneAuth.getDataONEJWT(repository.coordinatingNode);
            if (!dataOneJWT) {
              // reroute to auth
              $('#dataone-auth-modal').modal('show');
              return;
          }

            self.set('publishStatus', 'in_progress');
            self.set('progress', 0);            

            // Call the publish endpoint
            self.get("apiCall").publishTale(tale._id, repository.memberNode, repository.coordinatingNode, dataOneJWT)
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
         * Called when the user selects a repository in the dropdown menu.
         *
         * @method onRepositoryChange
        */
        onRepositoryChange: function () {
          let repositoryName = $('.repository.selection.dropdown.ui.dropdown').dropdown('get text');
          console.log('Selected '+ repositoryName + ' for publishing');
          let repository = this.get('repositories').find((repo) => repo.name === repositoryName);
          this.set('selectedRepository', repository);
        },
    }
});
