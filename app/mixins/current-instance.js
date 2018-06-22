import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Mixin.create({
  internalState: service(),
  getCurrentInstance() {
    let selected = this.get('internalState').getCurrentInstanceId();

    if(typeof selected !== 'undefined') {
      return this.get('store').findRecord('instance', selected, { reload: true });
    }

    return null;
  }
});
