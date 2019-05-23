import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  model() {
    this._super(...arguments);
    return RSVP.hash({
      instances: this.get('store').findAll('instance', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
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
      }),
      datasets: this.get('store').findAll('dataset', {
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
