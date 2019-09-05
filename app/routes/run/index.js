import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model() {
    this._super(...arguments);
    return this.get('store').findAll('tale', {
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });
  }
});
