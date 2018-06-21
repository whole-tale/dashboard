import RSVP from 'rsvp';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model(params) {
    this._super(params);
    return RSVP.hash({
      instances: this.get('store').findAll('instance', { reload: true }),
      selected: this.get('store').findRecord('instance', params.instance_id, {reload: true})
    });
  }
});
