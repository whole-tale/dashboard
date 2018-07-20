import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  internalState: Ember.inject.service(),

  model() {
    let state = this.get('internalState');
    let thisUserID = this.get('userAuth').getCurrentUserID();
    let allData = [];

    return RSVP.hash({
      recipes: this.get('store').findAll('recipe', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }),
      images: this.get('store').findAll('image', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      })
    });
  }

});
