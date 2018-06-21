import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  model(params) {
    this._super(params);
    let selected = params.instance_id;
    let check_exists = typeof selected !== 'undefined';
    return RSVP.hash({
      instances: this.get('store').findAll('instance', { reload: true }),
      selected: check_exists ? this.get('store').findRecord('instance', selected, { reload: true }) : null
    });
  }
});
