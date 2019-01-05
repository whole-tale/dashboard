import Component from '@ember/component';
import { A } from '@ember/array';
import {inject as service} from '@ember/service';
import EmberObject from '@ember/object';
import config from '../../../../config/environment';
import { later } from '@ember/runloop';
import { cancel } from '@ember/runloop';
import { none } from '@ember/object/computed';
import $ from 'jquery';
const O = EmberObject.create.bind(EmberObject);

export default Component.extend({
  internalState: service(),
  apiCall: service('api-call'),
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
  packageIdentifier: '',
  // The url for the published tale. This is set after publication succeeds
  packageUrl: '',
  statusMessage: '',
  tale: none,
  progress: 0,
  barColor: "#11d850",

  /**
   * Sets the UI state when the user opens the publishing modal. It checks to see if
   * the Tale has been published before or if it is currently being published.
   * 
   * @method init
   */
  init() {
    this._super(...arguments);
    let self = this;

    // Holds an array of objects that the user cannot be exclude from their package
    self.nonOptionalFile = [
      'tale.yaml',
      'docker-environment.tar.gz',
      'LICENSE',
      'metadata.xml'
    ];

    // A map that connects the repository dropdown to a url
    self.repositories = [{
      name: 'NCEAS Development',
      url: 'https://dev.nceas.ucsb.edu/knb/d1/mn/',
      licenses: ['cc0', 'ccby4']
    }];

    // Filtered list of licenses that are available for selection. This changes when the user
    // changes the selected repository.
    self.availableLicenses = [];

    // The licenses that the user can potentially select
    self.licenses = {
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

    self.get('store').findRecord('tale', self.get('modalContext'), {
        reload: false
      })
      .then(resp => {
        // Check if this Tale can be published
        self.set('tale', resp);
        if (resp.published) {
          self.talePublished(resp);
        }

        // We want to check if the last publish event is still running
        let lastJob = self.get('internalState').getLastPublishJob();
        
        if (lastJob) {
          self.get('store').findRecord('job', lastJob, {
            reload: true}).then(jobResp => {
              if (jobResp && jobResp.status == 2) {
              // Then there's already a publishing job running
              console.log('Publishing job running');

              // Check if the job is publishing this particular tale
              self.talePublishing(lastJob);
            } else {
              // Then the job finished, and the Tale may have been published
            }
          });
        } else if (!resp.published){
          // The Tale hasn't been published and it's not currently being published
        }
      });
  },

   /**
   * Sets UI components to the proper state when the user opens the
   * publishing modal and a publishing event has already taken place.
   * 
   * @method talePublished
   * @param taleInfo A Tale object returned from the /tale endpoint
   */
  talePublished(taleInfo) {
    let self=this;
    
    // Since the Tale has been published, show the publishing drop-down
    self.set('showPublishing', true);
    self.set('publishingSuccess', true);
    self.openPublishAccordion();
    // Complete the progressbar
    self.set('progress', 1);

    // Fill in the Tale's published identifier and url
    self.set('packageIdentifier', taleInfo.doi);
    self.set('packageURL', taleInfo.publishedURI);
    self.set('statusMessage', 'Your Tale has successfully been published to DataONE.');
  },

   /**
   * Sets UI components to the proper state when the user opens the
   * publishing modal and a publishing event is occuring.
   * 
   * @method talePublishing
   * @param lastJobId The ID of the job
   */
  talePublishing(lastJobId) {
    let self = this;
    self.set('showPublishing', true);
    self.openPublishAccordion();
    self.set('enablePublish', false);
    self.set('publishing', true);
    self.set('publishingID', lastJobId);

    // Poll the job queue for the status of the job
    self.handlePublishingStatus();
  },

  didInsertElement() {
    let self = this;
    self.set('selectedRepository', self.get('repositories')[0].name);
    self.setLicenses();
  },
        
  didRender() {
    // Create the tooltips after the template has been rendered
    this.create_tooltips();
  },

  setPublishBtnState(state) {
    this.set('enablePublish', state);
  },

  /**
   * Creates the tooltips that appear in the dialog
   * 
   * @method create_tooltips
   */
  create_tooltips() {
    // Create the popup in the main title
    $('.info.circle.blue.icon.main').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.main',
      hoverable: true,
      html: "Get a citeable DOI by publishing your Tale on <a href='https://www.dataone.org/' target='_blank'>DataONE.</a> " +
            "For more information on how to publish and cite your tale, visit the " +
            "<a href='http://wholetale.readthedocs.io/users_guide/publishing.html' target='_blank'>publishing guide</a>."
    });

    // Create the CC0 popup
    $('.info.circle.blue.icon.CC0').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.CC0',
      hoverable: true,
      html: "Place this tale in the public domain and opt out of copyright protection. " +
            "For more information, visit the <a href='https://spdx.org/licenses/CC0-1.0.html' target='_blank'>CC0 reference page</a>."
    });

    // Create the CCBY3 popup
    $('.info.circle.blue.icon.CC-BY3').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.CC-BY3',
      hoverable: true,
      html: "Require that users properly attribute the authors of this tale with the CCBY 3.0 standards. " +
            "For more information, visit the <a href='https://spdx.org/licenses/CC-BY-3.0.html' target='_blank'>CCBY3 reference page</a>."
    });

    // Create the CCBY4 popup
    $('.info.circle.blue.icon.CC-BY4').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.CC-BY4',
      hoverable: true,
      html: "Require that users properly attribute the authors of this tale with the CCBY 4.0 standards. " +
            "For more information, visit the <a href='https://spdx.org/licenses/CC-BY-4.0.html' target='_blank'>CCBY4 reference page</a>."
    });

    // Create the popups for the environment files. Files with an extension
    // need to have the period escaped with a double backslash when referencing.
    // Create the tale.yaml popup
    $('.info.circle.blue.icon.tale\\.yaml').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.tale\\.yaml',
      hoverable: true,
      html: "This file holds metadata about the tale, such as script execution order and file structure."
    });
    // Create the environment.tar popup
    $('.info.circle.blue.icon.docker-environment\\.tar\\.gz').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.docker-environment\\.tar\\.gz',
      hoverable: true,
      html: "The environment archive holds the information needed to re-create the tale's base virtual machine."
    });
    // Create the LICENSE popup
    $('.info.circle.blue.icon.LICENSE').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.LICENSE',
      hoverable: true,
      html: "Each package is created with a license, which can be selected below."
    });
    // Create the science_metadata popup
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

  joinArray(arr) {
    // Takes an array of the form [num1, num2, num3] and 
    // returns ["num1", "num2", "num3"]
    let result = [];
    arr.forEach(function (item) {
      result.push(JSON.stringify(item));
    });
    return result;
  },

  getItems(selectedObjects, itemIds) {
    let self = this;
    selectedObjects.forEach(
      function (entry) {
        if (entry.isItem) {
          itemIds.push(entry.id);
        } else {
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
    for (var i = 0; i < repostoryList.length; i++) {
      if (repostoryList[i].name === name) {
        return repostoryList[i].url;
      }
    }
  },

  getCurrentPublishJob() {
    let self = this;
    return this.get('store').findRecord('job', self.get('publishingID'));
  },

   /**
   * Opens the publishing dropdown
   * 
   * @method openPublishAccordion
   */
  openPublishAccordion() {
    $('.ui.accordion').accordion('open', 3);
  },

   /**
   * Asks the whole tale publish endpoint to start a publishing job
   * 
   * @method initiatePublish
   */
  initiatePublish: function () {
    let self = this;
    self.set('showPublishing', true);
    self.openPublishAccordion();
    let itemIds = self.prepareItemIds();

    // Called if publishing initialtion failed
    let onPublishinitialtionFail = (function (error) {
      // deal with the failure here
      console.log('Publishing failed: ' + error);
      this.set('publishingMessage', error);
    }).bind(this);

    // Called if publishing initialtion was a success
    let onPublishinitialtionSuccess = (function (jobId) {
      this.set('publishingID', jobId._id);
      this.get('internalState').setLastPublishJob(jobId._id);
      // Poll the job queue for the status of the job
      this.handlePublishingStatus();

      // Return false so the dialog stays open
      return false;
    }).bind(this);

    // Call the publish endpoint
    self.get("apiCall").publishTale(
      self.get('modalContext'),
      itemIds,
      self.getRepositoryPathFromName(self.get('selectedRepository')),
      self.get('dataoneJWT'),
      self.getSelectedLicense(),
      null,
      onPublishinitialtionSuccess,
      onPublishinitialtionFail);
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

  /**
   * Sets the licenses that the user sees in the GUI
   * 
   * @method setLicenses
   */
  setLicenses() {
    // Sets the licenses that the user can choose from, based on the selected repository
    let self = this;
    if (self.get('selectedRepository') === 'NCEAS Development') {
      let availableLicenses = [];

      self.get('repositories')[0].licenses.forEach(function (entry) {
        let licenses = self.get('licenses');
        availableLicenses.push(licenses[entry]);
      });
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

  handlePublishingStatus() {
    let self = this;
    let currentLoop = null;
    // Poll the status of the instance every second using recursive iteration
    let startLooping = function (func) {

      return later(function () {
        currentLoop = startLooping(func);
        self.store.findRecord('job', self.get('publishingID'), {
            reload: true
          })
          .then(job => {
            if (job.get('status') === 3) {
              if (job.progress) {
                self.set('progress', job.progress.current / 100);
                self.set('statusMessage', job.progress.message);
              }
              // Then the job completed
              self.set('publishing', false);
              self.set('publishingSuccess', true);

              // The Tale was changed by the job, so fetch it again
              self.get('store').findRecord('tale', self.get('modalContext'), {
                  reload: true
                })
                .then(resp => {
                  // Update UI with Tale information
                  self.set('tale', resp);
                  self.set('packageIdentifier', resp.doi);
                  self.set('packageURL', resp.publishedURI);
                  cancel(currentLoop);
                });
            } else if (job.get('status') === 4) {
              // Then the job failed with an error
              self.set('publishing', false);
              self.set('publishingSuccess', false);
              self.set('statusMessage', job.log);
              self.set('progress', 100)
              self.set('barColor', "#F83005");
              cancel(currentLoop);
            } else {
              // Otherwise the job is still running
              // Update the progressbar
              if (job.progress) {
                self.set('progress', job.progress.current / 100);
                self.set('statusMessage', job.progress.message);
              }
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

  /**
   * Closes the publishing modal
   * 
   * @method closeModal
   */
    closeModal() {
      return this.closeModal();
    },

  /**
   * Handles a user click on the publish button.
   * 
   * @method publishClicked
   */
    publishClicked() {
      /* 
      Called when the `Publish` button is clicked. It controls the flow
      of logging in and communicating with the `createPackage` endpoint.
      */
      let self = this;

      // Disable the button so that it isn't accidentally clicked multiple times
      self.set('enablePublish', false);
      self.clearPublishingState();

      // Let the UI know that the user clicked the `Publish` button. 
      self.set('publishing', true);
      let jwt = self.dataoneAuth.getDataONEJWT();

      self.set('dataoneJWT', jwt);
      // If they are, go ahead and publish
      self.initiatePublish();
      return false;
    },

    onRepositoryChange: function () {
      // Called when the user changes the repository
      this.setLicenses()
    },

    denyDataONE() {
      return true;
    },
  },
});
