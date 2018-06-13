import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  userAuth: Ember.inject.service(),

  model() {
    let currentUserId = this.get('userAuth').getCurrentUserID();

    return {
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
      }),
      images: this.get('store').findAll('image', {
        reload: true,
        adapterOptions: {
          queryParams: {
            sort: "lowerName",
            sortdir: "1",
            limit: "50"
          }
        }
      })
    };
  }
});
