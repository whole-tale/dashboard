import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model() {
    return {
      tales: this.get('store').findAll('tale', {reload: true, adapterOptions: { queryParams:{sort: "created", sortdir: "1", limit: "0"}}})
    };
  }
});
