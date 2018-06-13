import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  internalState: Ember.inject.service(),

  model() {
    let state = this.get('internalState');
    let thisUserID = this.get('userAuth').getCurrentUserID();
    let data = this.get('store').query('folder', {
      parentId: thisUserID,
      parentType: "user"
    });
    let registered = this.get('store').query('folder', {
      adapterOptions: {
        registered: true
      }
    });
    let allData = [];

    data.forEach(function (model) {
      allData.push(model);
    });
    registered.forEach(function (model) {
      allData.push(model);
    });

    return {
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
      tales: this.get('store').findAll('tale'),
      dataRegistered: registered,
      allData: registered
    };
  }

});
