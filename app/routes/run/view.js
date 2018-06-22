import RSVP from 'rsvp';
import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';

export default AuthenticateRoute.extend({
  internalState: service(),
  model(params) {
    this._super(params);
    this.get('internalState').setCurrentInstanceId(params.instance_id);
    return RSVP.hash({
      instances: this.get('store').findAll('instance', { reload: true }),
      selected: this.get('store').findRecord('instance', params.instance_id, {reload: true})
    });
  }
});
