import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  model() {
    this._super(...arguments);
    return RSVP.hash({
      instances: this.get('store').findAll('instance', {
        reload: true
      }),
      tales: this.get('store').findAll('tale', {
        reload: true,
        adapterOptions: {
          queryParams: {
            sort: "created",
            sortdir: "1",
            limit: "0"
          }
        }
      })
    });
  }
});
