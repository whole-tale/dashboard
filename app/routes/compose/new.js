import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  internalState: Ember.inject.service(),

  model() {
    let state = this.get('internalState');
    let thisUserID = this.get('userAuth').getCurrentUserID();
    let data = this.get('store').query('folder', {
      parentId: thisUserID,
      parentType: "user",
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });
    let registered = this.get('store').query('folder', {
      adapterOptions: {
        appendPath: "registered",
        queryParams: {
          limit: "0"
        }
      }
    });
    let allData = [];

    data.forEach(function (model) {
      allData.push(model);
    });
    registered.forEach(function (model) {
      allData.push(model);
    });

    return RSVP.hash({
      data: data,
      images: this.get('store').findAll('image', {
        reload: true,
        adapterOptions: {
          queryParams: {
            sort: "lowerName",
            sortdir: "1",
            limit: "50"
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
      dataRegistered: registered,
      allData: registered
    });
  }

});
