import Component from '@ember/component';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import layout from './template';

export default Component.extend({
    layout,
    store: service(),
    apiCall: service('api-call'),
    router: service(),
    
    taleToCopy: null,


    actions: {
        closeCopyOnLaunchModal() {
            console.log("Cancelled.");
          const component = this;
          $('#copy-on-launch-modal').modal('hide');
          component.set('taleToCopy', null);
        },
        
        submitCopyAndLaunch(taleToCopy) {
          console.log("Submitted.");
          
          const self = this;
          self.set('copyingTale', true);
          const originalTale = self.get('taleToCopy');
          if (originalTale) {
              
              let handleLaunchError = (tale, err) => {
                // deal with the failure here
                //tale.set('launchStatus', 'error');
                //tale.set('launchError', err.message || err);
                
                console.error('Failed to launch Tale', err);
              };
              
            self.get('apiCall').copyTale(originalTale).then(taleCopy => {
              let eTaleCopy = EmberObject.create(taleCopy);
              self.apiCall.startTale(eTaleCopy).then((instance) => {
                console.log(`Transitioning to /run/${eTaleCopy._id}`);
                self.router.transitionTo('run.view', eTaleCopy._id);
                self.apiCall.waitForInstance(instance).then((instance) => {
                    console.log('Tale is now started:', eTaleCopy);
                  }).catch((err) => handleLaunchError(eTaleCopy, err));
              }).catch((err) => handleLaunchError(eTaleCopy, err));
            });
          }
        },
                
                
                
                // Dead code: 
                
                
                
                
                /*
              self.set('copyingTale', false);
              self.actions.closeCopyOnLaunchModal.call(self);
              
              // Convert JSON response to an EmberObject
              let eTaleCopy = EmberObject.create(taleCopy);
              
              // Push to models in view
              // TODO: Detect filtered view?
              const tales = self.get('modelsInView');
              if (tales) {
                  tales.pushObject(eTaleCopy);
                  self.set('modelsInView', A(tales));
              }
              
              // Reset state manually when re-launching
              eTaleCopy.set('launchError', null);
              eTaleCopy.set('launchStatus', 'starting');
              eTaleCopy.set('launchResetRequest', null);
          
                
              
              // Launch the newly-copied tale
              return self.apiCall.startTale(eTaleCopy).then((instance) => {
                eTaleCopy.set('instance', instance);
                self.apiCall.waitForInstance(instance).then((instance) => {
                    eTaleCopy.set('instance', instance);
                    self.get('taleLaunched')();
                    eTaleCopy.set('launchError', null);
                    eTaleCopy.set('launchStatus', 'started');
                    console.log('Tale is now started:', eTaleCopy);
                    resetStatusAfterMs(eTaleCopy, 10000);
                  }).catch((err) => handleLaunchError(eTaleCopy, err));
              }).catch((err) => handleLaunchError(eTaleCopy, err));
            });
          } else {
            console.log('No tale to copy... something went wrong!');
          }*/
    }
});
