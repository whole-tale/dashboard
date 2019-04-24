import Component from '@ember/component';
import { A } from '@ember/array';
import {inject as service} from '@ember/service';
import { later } from '@ember/runloop';
import { cancel } from '@ember/runloop';
import { none } from '@ember/object/computed';
import $ from 'jquery';

export default Component.extend({
  internalState: service(),
  apiCall: service('api-call'),
  authRequest: service(),
  store: service(),
  dataoneAuth: service('dataone-auth'),
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
  statusMessage: String(),
  // The publishing job's ID
  publishingID: null,
  // The DOI of the package
  packageIdentifier: '',
  // The url for the published tale. This is set after publication succeeds
  packageUrl: '',
  // The Tale being published
  tale: none,
  // Current progress level of the progress bar
  progress: 0,
  // The message that the user sees below the progress bar
  statusMessage: '',
  // Color of the progress bar
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
      'manifest.json',
      'environment.json',
      'LICENSE',
      'README.md',
      'metadata.xml'
    ];

    // A map that connects the repository dropdown to a url
    self.repositories = [{
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
    }];

    self.get('store').findRecord('tale', self.get('modalContext'), {
        reload: false
      })
      .then(resp => {
        self.set('tale', resp);
        // We want to check if the last publish event is still running
        let lastJob = self.get('internalState').getLastPublishJob();
        
        if (lastJob) {
          self.get('store').findRecord('job', lastJob, {
            reload: true
          }).then(jobResp => {
            if (jobResp && jobResp.status == 2) {
              // Check if the job is publishing this particular tale
              self.talePublishing(lastJob);
            } else if (resp.publishInfo.length > 0) {
              self.talePublished(resp);
            }
          }).catch(()=>{
             console.log('Error fetching lastJob', lastJob);
          });
        }
        else if (!resp.publishInfo || resp.publishInfo.length > 0) {
          self.talePublished(resp);
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
    self.set('packageIdentifier', taleInfo.publishInfo.slice(-1).pop().pid);
    self.set('packageURL', taleInfo.publishInfo.slice(-1).pop().uri);
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
 
    self.set('enablePublish', false);
    self.set('publishing', true);
    self.set('publishingID', lastJobId);
    self.openPublishAccordion();
    // Poll the job queue for the status of the job
    self.handlePublishingStatus();
  },

  didInsertElement() {
    let self = this;
    self.set('selectedRepository', self.get('repositories')[0].name);
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

    // Create the popups for the environment files. Files with an extension
    // need to have the period escaped with a double backslash when referencing.
    // Create the tale.yaml popup
    $('.info.circle.blue.icon.manifest\\.json').popup({
      position: 'right center',
      target: '.info.circle.blue.icon.manifest\\.json',
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
      html: "The Tale's license is included in the package. This can be selected from the Tale's metadata view."
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
    $('.ui.accordion').accordion('open', 1);
  },

   /**
   * Asks the whole tale publish endpoint to start a publishing job
   * 
   * @method initiatePublish
   */
  initiatePublish: function () {
    let self = this;
    self.set('showPublishing', true);
    // Called if the publishing endpoint failed
    let onPublishinitialtionFail = (function (error) {
      // deal with the failure here
      this.set('statusMessage', error);
      this.set('progress', 0);
    }).bind(this);

    // Called if publishing initiation was a success
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
      self.getRepositoryPathFromName(self.get('selectedRepository')),
      self.get('dataoneJWT'),
      onPublishinitialtionSuccess,
      onPublishinitialtionFail);
    
    // Give the UI a chance to render the accordion
    later((function() {
      self.openPublishAccordion();
    }), 1300);
    
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
                  self.set('packageIdentifier', resp.publishInfo.slice(-1).pop().pid);
                  self.set('packageURL', resp.publishInfo.slice(-1).pop().uri);
                  cancel(currentLoop);
                });
            } else if (job.get('status') === 4) {
              // Then the job failed with an error
              self.set('publishing', false);
              self.set('publishingSuccess', false);
              self.setErrorStatus(job._id)
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
    this.set('statusMessage', ' ');
  },

  /* 
   * Retrieves a human readable error from job/result
   * 
   * @method closeModal
  */
  setErrorStatus(jobId) {
    let onGetJobStatusSuccess = (function (message) {
      this.set('statusMessage', message);
    }).bind(this);

    this.apiCall.getFinalJobStatus(jobId,
       onGetJobStatusSuccess,
       onGetJobStatusSuccess);
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
      self.set('statusMessage', '');
      let jwt = self.dataoneAuth.getDataONEJWT();

      self.set('dataoneJWT', jwt);
      // If they are, go ahead and publish
      self.initiatePublish();
      return false;
    },

    onRepositoryChange: function () {
      // Called when the user changes the repository
      let respText = $('.repository.selection.dropdown.ui.dropdown').dropdown('get text')
      this.set('selectedRepository', respText);
    },

    denyDataONE() {
      return true;
    },
  },
});
