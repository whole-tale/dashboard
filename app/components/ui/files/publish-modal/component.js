import Component from '@ember/component';
//import layout from './template';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { later, cancel } from '@ember/runloop';
import $ from 'jquery';

/** TODO: All of this should probably be sourced on the server somehow..
design discussion will likely be required */

/*
// Holds an array of objects that the user cannot be exclude from their package
const nonOptionalFiles = [
  { 
    name: 'manifest.json', 
    toolTipHtml: "This file holds metadata about the tale, such as script execution order and file structure."
  },
  {
    name: 'environment.json',
    toolTipHtml: "This environment file holds the information needed to re-create the tale's base virtual machine."
  },
  {
    name: 'LICENSE',
    toolTipHtml: "The Tale's license is included in the package. This can be selected from the Tale's metadata view."
  },
  {
    name: 'README.md',
    toolTipHtml: "The Tale's README is included in the package. The README includes instructions for how to use and run the published analysis encapsulated by your Tale."
  },
  {
    name: 'metadata.xml',
    toolTipHtml: "The contents of each package are described using the " +
      "Ecological Metadata Language (EML). To learn more about EML, visit the " +
      "<a href='https://esajournals.onlinelibrary.wiley.com/doi/abs/" + 
      "10.1890/0012-9623%282005%2986%5B158%3AMTVOED%5D2.0.CO%3B2'" +
      "target='_blank'>EML primer</a>."
  }
];

const mainToolTipHtml = "Get a citeable DOI by publishing your Tale on " +
  "<a href='https://www.dataone.org/' target='_blank'>DataONE.</a> " +
  "For more information on how to publish and cite your tale, visit the " +
  "<a href='https://wholetale.readthedocs.io/en/stable/users_guide/publishing.html' target='_blank'>publishing guide</a>.";

// An array of repositories to list in the dropdown and their matching url
const repositories = [
  {
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
  }
];*/

//const defaultRepository = (repositories && repositories.length) ? repositories[0] : null;

export default Component.extend({
  //layout,
  name: 'publish-modal',
  classNames: [ 'publish-modal' ],
  model: null,
  /*dataoneAuth: service('dataone-auth'),
  apiCall: service('api-call'),
  mainToolTipHtml: mainToolTipHtml,
  nonOptionalFiles: nonOptionalFiles,
  repositories: repositories,
  selectedRepository: null,
  publishStatus: 'initialized',
  progress: 0,
  statusMessage: '',
  packageURL: '',
  packageIdentifier: '',*/
  
  
  /*repoDropdownClass: computed('publishStatus', function() {
      let status = this.publishStatus;
      return (status === 'in_progress' || status === 'success') 
          ? "repository fluid selection dropdown disabled"
          : "repository fluid selection dropdown";
  }),*/
  
  init() {
    //this.resetPublishState();
  },
  
  /*didRender() {
    $('.ui.accordion').accordion({});
    //this.loadTooltips();
  },*/
        
  /*resetPublishState() {
      // Reset any leftover previous state
      this.set('progress', 0);
      this.set('statusMessage', '');
      this.set('publishStatus', 'initialized');
  },*/
  
  /**
   * Creates the tooltips that appear in the dialog
   * 
   * @method loadTooltips
   */
  /*loadTooltips() {
      // Create the popup in the main title
      $('.info.circle.blue.icon.main').popup({
        position: 'right center',
        hoverable: true,
        html: mainToolTipHtml
      });
      
      this.get('nonOptionalFiles').forEach(file => {
        let escapedFilename = file.get('name').replace(/\./g, "\\.");
        $('.info.circle.blue.icon.' + escapedFilename).popup({
          position: 'right center',
          hoverable: true,
          html: file.toolTipHtml
        });
      });
  },*/
  
  handlePublishingStatus(tale, jobId) {
      /*let self = this;
      let currentLoop = null;
      // Poll the status of the instance every second using recursive iteration
      let startLooping = function (func) {
  
        return later(function () {
          currentLoop = startLooping(func);
          
          const store = self.get('store');
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
                //self.set('progress', 100);
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
      currentLoop = startLooping();*/
  },

  /* 
   * Retrieves a human readable error from job/result
   * 
   * @method setErrorStatus
   */
  /*setErrorStatus(jobId) {
      const self = this;
      let onGetJobStatusSuccess = (message) => {
        self.set('statusMessage', message);
      };
  
      self.set('publishStatus', 'error');
      return self.apiCall.getFinalJobStatus(jobId)
          .then(onGetJobStatusSuccess)
          .catch(onGetJobStatusSuccess);
  },*/
  
  actions: {
    
    submitPublish() {
      /*const self = this;
      const tale = self.get('model').get('tale');
      console.log('Now publishing:', tale);
      self.set('publishStatus', 'in_progress');
      self.set('progress', 0);
      const repoUrl = self.get('selectedRepository').url;
      const dataOneJWT = self.get('dataoneAuth').getDataONEJWT();
      
      // Call the publish endpoint
      self.get("apiCall").publishTale(tale._id, repoUrl, dataOneJWT)
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
          
      return false;*/
    },
    
    closePublishModal() {
      /*$('#publish-modal').modal('hide');
      
      // XXX: is this still needed?
      this.resetPublishState();
      
      return true;*/
    },
  },
});
