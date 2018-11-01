import Component from '@ember/component';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import config from '../../../../config/environment';
import { later } from '@ember/runloop';
import { cancel } from '@ember/runloop';
import { none } from '@ember/object/computed';
const O = EmberObject.create.bind(EmberObject);

// The states that the publishing job can have
/* const INACTIVE = 0;
const QUEUED = 1;
const RUNNING = 2;
const SUCCESS = 3;
const ERROR = 4;
const CANCELED = 5; */

export default Component.extend({
    internalState: service(),
    authRequest: service(),
    store: service(),
    dataoneAuth: service('dataone-auth'),
    inputData: A(),
    entryPoint: O({}),
    // Controls the state of the publish button
    enablePublish: true,
    // The repository that the user has selected
    selectedRepository: '',
    // Flag that sets/un-sets the spinner on the publish button
    publishing: false,
    // Set when publishing has finished
    publishingSuccess: false,
    // The jwt token that allows the user to interact with DataONE
    dataoneJWT: '',
    // Flag that shows/hides the publishing section
    showPublishing: false,
    // Holds any publishing error messages
    publishingMessage: String(),
    // The publishing job's ID
    publishingID: null,
    // The DOI of the package
    packageDOI: '',
    // The url for the published tale. This is set after publication succeeds
    packageUrl: '',
    statusMessage: '',
    tale: none,
    progress: 0,
    barColor:"#11d850",

    init() {
        this._super(...arguments);
        console.log('init called')
        // Holds an array of objects that the user cannot be exclude from their package
        this.nonOptionalFile = ['tale.yaml', 'docker-environment.tar.gz',
            'LICENSE', 'metadata.xml'];

                // A map that connects the repository dropdown to a url
        this.repositories = [
            {
                name: 'NCEAS Development',
                url: 'https://dev.nceas.ucsb.edu/knb/d1/mn/',
                licenses: ['cc0', 'ccby4']
            }
        ];

        // The licenses that the user can potentially select
        this.licenses = {
            'cc0': {
                'name': 'Creative Commons Public Domain CCO',
                'spdx': 'CC0-1.0',
                'short': 'CC0',
                'imageName': '/images/CC0.png'
            },
            'ccby3': {
                'name': 'Creative Commons Attribution CC-BY 3.0',
                'spdx': 'CC-BY-3.0',
                'short': 'CC-BY3',
                'imageName': '/images/CC-BY3.png'
            },
            'ccby4': {
                'name': 'Creative Commons Attribution CC-BY 4.0',
                'spdx': 'CC-BY-4.0',
                'short': 'CC-BY4',
                'imageName': '/images/CC-BY4.png'
            }
        };
        // Filtered list of licenses that are available for selection. This changes when the user
        // changes the selected repository.
        this.availableLicenses = [];

        let self = this;
        this.get('store').findRecord('tale', this.get('modalContext') , { reload:false })
        .then(resp => {
            // Check if this Tale can be published
            console.log('Setting Tale')
            self.set('tale', resp);
        if (resp.published) {
            console.log('Tale has been published');
            // Since the Tale has been published, show the publishing drop-down
            self.set('showPublishing', true);
            self.set('publishingSuccess', true);
            self.openPublishAccordion();
            self.set('progress', 1);
            // Fill in the Tale's published identifier and url
            self.set('packageDOI', resp.doi);
            self.set('packageURL', resp.publishedURI);
            self.set('statusMessage', 'Your Tale has successfully been published to DataONE.');
        }
        else {

            scheduleOnce('afterRender', this, () => {
                console.log('Opening publish-intro modal');
                let selector = '.ui.publish-intro.modal';
                $(selector).modal('show');
              });
        }

        // We want to check if the last publish event is still running
        let lastJob = this.get('internalState').getLastPublishJob();
        let lastJobObj = undefined;

        if(lastJob) {
            this.get('store').findRecord('job', lastJob, { reload: true }).then(resp => {
                lastJobObj = resp;

                if (lastJobObj && lastJobObj.status == 2) {
                // Then there's already a publishing job running
                console.log('Showing running job')
                self.set('showPublishing', true);
                self.openPublishAccordion();
                self.set('enablePublish', false);
                self.set('publishing', true);
                self.set ('publishingID', lastJob._id);
                // Poll the job queue for the status of the job
                self.handlePublishingStatus();
                }
                else {
                    console.log('Previous job not showing')
                }
            });
        }
        else {
            console.log('previous job not found')
        }

        });
    },

    didInsertElement() {
        console.log('didInsertElement called')
        let self = this;
        self.set('selectedRepository', self.get('repositories')[0].name);
        self.setLicenses();
        // Check if the Tale has been published already
    },

    didRender () {
        // Create the tooltips after the template has been rendered
        console.log('didRender called');
        this.create_tooltips();
    },

    setPublishBtnState(state) {
        this.set('enablePublish', state);
    },

    create_tooltips() {
        // Create the popup in the main title
        $('.info.circle.blue.icon.main').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.main',
            hoverable: true,
            html: "Get a citeable DOI by publishing your Tale on <a href='https://www.dataone.org/' target='_blank'>DataONE.</a> \
            For more information on how to publish and cite your tale, visit the \
            <a href='https://wholetale.readthedocs.io/en/stable/users_guide/publishing.html' target='_blank'>publishing guide</a>."
        });

        // Create the CC0 popup
        $('.info.circle.blue.icon.CC0').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.CC0',
            hoverable: true,
            html: "Place this tale in the public domain and opt out of copyright protection. \
            For more information, visit the <a href='https://spdx.org/licenses/CC0-1.0.html' target='_blank'>CC0 reference page</a>."
          });

        // Create the CCBY3 popup
        $('.info.circle.blue.icon.CC-BY3').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.CC-BY3',
            hoverable: true,
            html: "Require that users properly attribute the authors of this tale with the CCBY 3.0 standards. \
            For more information, visit the <a href='https://spdx.org/licenses/CC-BY-3.0.html' target='_blank'>CCBY3 reference page</a>."
          });

        // Create the CCBY4 popup
        $('.info.circle.blue.icon.CC-BY4').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.CC-BY4',
            hoverable: true,
            html: "Require that users properly attribute the authors of this tale with the CCBY 4.0 standards. \
            For more information, visit the <a href='https://spdx.org/licenses/CC-BY-4.0.html' target='_blank'>CCBY4 reference page</a>."
          });

        // Create the popups for the environment files. Files with an extension
        // need to have the period escaped with a double backslash when referencing.
        // Create the tale.yaml popup
        $('.info.circle.blue.icon.tale\\.yaml').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.tale\\.yaml',
            hoverable: true,
            html: "This file holds metadata about the tale, such as script execution order and file structure."
        });
        // Create the environment.tar popup
        $('.info.circle.blue.icon.docker-environment\\.tar\\.gz').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.docker-environment\\.tar\\.gz',
            hoverable: true,
            html: "The environment archive holds the information needed to re-create the tale's base virtual machine."
        });
         // Create the LICENSE popup
        $('.info.circle.blue.icon.LICENSE').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.LICENSE',
            hoverable: true,
            html: "Each package is created with a license, which can be selected below."
        });
         // Create the science_metadata popup
        $('.info.circle.blue.icon.metadata\\.xml').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.metadata\\.xml',
            hoverable: true,
            html: "The contents of each package are described using the Ecological Metadata Language (EML). \
             To learn more about EML, visit the \
             <a href='https://esajournals.onlinelibrary.wiley.com/doi/abs/10.1890/0012-9623%282005%2986%5B158%3AMTVOED%5D2.0.CO%3B2' \
              target='_blank'>EML primer</a>."
        });
    },

    joinArray(arr) {
        // Takes an array of the form [num1, num2, num3] and 
        // returns ["num1", "num2", "num3"]
        let result = [];
        arr.forEach(function(item) {
            result.push(JSON.stringify(item));
        });
        return result;
    },

    getItems(selectedObjects, itemIds) {
        let self = this;
        selectedObjects.forEach(
            function(entry) {
                if (entry.isItem) {
                    itemIds.push(entry.id);
                }
                else {
                    self.getItems(entry.files, itemIds);
                }
        });
        return itemIds;
    },

    prepareItemIds() {
        // Takes the selected items and formats them for the endpoint
        let self = this;
        let selectedData = self.get('inputData');
        let itemIds = self.getItems(selectedData, []);
        return self.joinArray(itemIds);
    },

    getRepositoryPathFromName(name) {
        // Given a repository name, find the membernode URL
        let repostoryList = this.get('repositories');
        for (var i=0; i < repostoryList.length; i++) {
            if (repostoryList[i].name === name) {
                return repostoryList[i].url;
            }
        }
    },

    getCurrentPublishJob() {
        let self = this;
        return this.get('store').findRecord('job', self.get('publishingID'));
    },

    openPublishAccordion() {
        // Open the publishing accordion
        $('.ui.accordion').accordion('toggle', 3);
    },

    publish: function(){
        let self = this;
        self.set('showPublishing', true);
        self.openPublishAccordion();
        let itemIds = self.prepareItemIds();
        // Set the url parameters for the endpoint
        let queryParams = '?' + [
            'itemIds=' + '[' + itemIds + ']',
            'taleId=' + self.get('modalContext'),
            'remoteMemberNode=' + self.getRepositoryPathFromName(self.get('selectedRepository')),
            'authToken=' + self.get('dataoneJWT'),
            'licenseSPDX='+self.getSelectedLicense(),
            'provInfo= + {"entryPoint": "null"}'
        ].join('&');
        
        let url = config.apiUrl + '/publish/dataone' + queryParams;
        this.get('authRequest').send(url)
        .catch (e=> {
            self.set('publishingMessage', e);
        })
            .then(rep => {
                console.log(rep);
                self.set ('publishingID', rep._id);
                this.get('internalState').setLastPublishJob(rep._id);
                // Poll the job queue for the status of the job
                self.handlePublishingStatus();
            })
            .finally(_ => {
                // Return false so the dialog stays open
                return false;
            });
        },

getSelectedLicense() {
    // Returns the id of the selected license
    let selected_radio = $('input[name=license-radio]:checked').parent();
    if (selected_radio.length) {
        return selected_radio[0].id;
    }
    //If we can't find a checked radio, default to cc0
    return this.get('licenses').cc0.spdx;
  },

  setLicenses() {
    // Sets the licenses that the user can choose from, based on the selected repository
    let self=this;
      if (self.get('selectedRepository') === 'NCEAS Development') {
            let availableLicenses = []

            self.get('repositories')[0].licenses.forEach(function(entry) {
                let licenses = self.get('licenses')
                availableLicenses.push(licenses[entry])
        });
        console.log(availableLicenses)
        self.set('availableLicenses', availableLicenses);
      }
      else {
          // If for some reason the dropdown isn't set, default to CC0
          self.set('availableLicenses', [self.get('licenses').cc0]);
      }
  },

    isUrl(s) {
    var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
    },

    checkValues() {
        let self = this;
        let selectedData = self.get('inputData');
        let itemIds = self.getItems(selectedData, []);
        // Check if the user forgot to pick any files
        if (itemIds === undefined || itemIds.length == 0) {
            return false;
        }
    },

    handlePublishingStatus() {
        //let component = this;
        let self = this;
          let currentLoop = null;
          // Poll the status of the instance every second using recursive iteration
          let startLooping = function (func) {
            
            return later(function () {
              currentLoop = startLooping(func);
              self.store.findRecord('job', self.get('publishingID'), { reload: true })
                .then(job => {
                    console.log('JOB');
                    console.log(job);
                    if (job.get('status') === 3) {
                        if (job.progress) {
                            console.log(job.progress.current);
                            self.set('progress', job.progress.current/100);
                            self.set('statusMessage', job.progress.message);
                        }
                        // Then the job completed
                        console.log('Registration complete');
                        self.set('publishing', false);
                        self.set('publishingSuccess', true);

                        // The Tale was changed by the job, so fetch it again
                        self.get('store').findRecord('tale', self.get('modalContext') , { reload:false })
                        .then(resp => {
                            console.log('Getting new tale');
                            console.log(resp);
                            self.set('tale', resp);
                            self.set('packageDOI', resp.doi);
                            self.set('packageURL', resp.publishedURI);
                            cancel(currentLoop);
                        });
                    }
                    else if (job.get('status') === 4) {
                        console.log('Registration failed');
                        console.log(job)
                        console.log(job.log)
                        // Then the job failed with an error
                        self.set('publishing', false);
                        self.set('publishingSuccess', false);
                        self.set('statusMessage', job.log);
                        self.set('progress', 100)
                        self.set('barColor', "#F83005");
                        cancel(currentLoop);
                    }
                    else {
                        // Otherwise the job is still running
                        // Update the progressbar
                        if(job.progress) {
                            console.log(job.progress.current)
                            self.set('progress', job.progress.current/100);
                            self.set('statusMessage', job.progress.message);
                        }
                        console.log('Registration running')
                        console.log(job)
                    }
                  });
            }, 1000);
          };
          //Start polling
          currentLoop = startLooping();
      },

      clearPublishingState() {
        this.set('publishingSuccess', false);
        this.set('progress', 0);
        this.set('publishingMessage', ' ');
    },

    actions: {
        closeModal() {
            return this.closeModal();
        },

        publishedClicked(){
            /* 
            Called when the `Publish` button is clicked. It controls the flow
            of logging in and communicating with the `createPackage` endpoint.
            */
           let self = this;
        
           // Disable the button so that it isn't accidentally clicked multiple times
           self.set('enablePublish', false);
           self.clearPublishingState();
           
           if(!self.checkValues()) {
               console.log('complain here')
           }
           // Let the UI know that the user clicked the `Publish` button. 
           self.set('publishing', true);
           let jwt = self.dataoneAuth.getDataONEJWT();

           if (jwt) {
              self.set('dataoneJWT', jwt);
               // If they are, go ahead and publish
               self.publish();
           }
           else {
               console.log('Error not logged in.')
           }
           return false;
        },

        onRepositoryChange: function() {
            // Called when the user changes the repository
               this.setLicenses()
        },

        denyDataONE() {
            return true;
          },
    },
});
