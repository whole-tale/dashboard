import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { computed, observer} from '@ember/object';
import { A } from '@ember/array';
import { later, cancel } from '@ember/runloop';
import $ from 'jquery';

const O = EmberObject.create.bind(EmberObject);

export default Component.extend({
  
  actions: {
    closeCopyOnLaunchModal() {
      const component = this;
      $('#copy-on-launch-modal').modal('hide');
      component.set('taleToCopy', null);
    },
    
    submitCopyAndLaunch(taleToCopy) {
      throw new Error("submitCopyAndLaunch must be overridden");
    },
  }
});