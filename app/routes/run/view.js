import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  internalState: service(),
  model(params) {
    this._super(params);
    this.get('internalState').set('currentInstanceId', params.instance_id);
    return RSVP.hash({
      instances: this.get('store').findAll('instance', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }),
      selected: this.get('store').findRecord('instance', params.instance_id, { reload: true })
    });
  }
});
