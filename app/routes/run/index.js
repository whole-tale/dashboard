import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model() {
    this._super(...arguments);
    return this.get('store').findAll('instance', { reload: true });
  }
});
