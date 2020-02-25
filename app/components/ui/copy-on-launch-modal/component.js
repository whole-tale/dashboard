import Component from '@ember/component';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import layout from './template';

export default Component.extend({
    layout,
    store: service(),
    apiCall: service('api-call'),
    router: service(),
    errorMessage: "",
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
                console.error('Failed to launch Tale', err);
                self.set("errorMessage", err.message);
                $('.ui.modal.compose-error').modal('show');
              };
              
            self.get('apiCall').copyTale(originalTale).then(taleCopy => {
              let eTaleCopy = EmberObject.create(taleCopy);
              self.apiCall.startTale(eTaleCopy).then((instance) => {
                console.log(`Transitioning to /run/${eTaleCopy._id}`);
                self.apiCall.waitForInstance(instance).then((instance) => {
                    console.log('Tale is now started:', eTaleCopy);
                }).catch((err) => handleLaunchError(eTaleCopy, err));
                self.router.transitionTo('run.view', eTaleCopy._id);
              }).catch((err) => handleLaunchError(eTaleCopy, err));
            });
          }
        },
    }
});
