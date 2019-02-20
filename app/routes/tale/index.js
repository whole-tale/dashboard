import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  model() {
    return {
      tales: this.get('store').findAll('tale', {
        backgroundReload: false,
        reload: false,
        adapterOptions: {
          queryParams: {
            sort: "created",
            sortdir: "1",
            limit: "0"
          }
        }
      })
    };
  }
});
