import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  internalState: Ember.inject.service(),

  model() {
    var state = this.get('internalState');
    var thisUserID = this.get('userAuth').getCurrentUserID();
    var data = this.get('store').query('folder', {parentId: thisUserID, parentType : "user" });
    var registered = this.get('store').query('folder', {adapterOptions:{registered: true}});
    var allData = [];

    data.forEach(function(model) {
      allData.push(model);
    });
    registered.forEach(function(model) {
      allData.push(model);
    });

    return {
      data: data,
      images: this.get('store').findAll('image'),
      tales: this.get('store').findAll('tale'),
      dataRegistered: registered,
      allData: registered
    };
  }

});
