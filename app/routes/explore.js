import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  model() {
    return RSVP.hash({
        images: this.get('store').findAll('image', {
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
              limit: "0"
            }
          }
        }),
        dataRegistered: this.get('store').query('folder', {
          reload: true,
          adapterOptions: {
            appendPath: "registered",
            queryParams: {
              limit: "0"
            }
          }
        })
    });
  }
});
