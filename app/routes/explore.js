import Ember from 'ember';

import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model() {

    return {
      images: this.get('store').findAll('image'),
      dataRegistered: this.get('store').query('folder', {adapterOptions:{registered: true}})
    };
  }
});
