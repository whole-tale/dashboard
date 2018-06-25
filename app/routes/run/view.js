import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';

export default AuthenticateRoute.extend({
  internalState: service(),
  model(params) {
    this._super(params);
    this.get('internalState').set('currentInstanceId', params.instance_id);
    return this.get('store').findAll('instance', { reload: true });
  }
});
