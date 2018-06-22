import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';
import CurrentInstanceMixin from 'wholetale/mixins/current-instance'

export default AuthenticateRoute.extend(CurrentInstanceMixin, {
  model() {
    this._super(...arguments);
    return RSVP.hash({
      instances: this.get('store').findAll('instance', { reload: true }),
      selected: this.getCurrentInstance()
    });
  }
});
