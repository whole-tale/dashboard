import AuthenticateRoute from 'wholetale/routes/authenticate';
import CurrentInstanceMixin from 'wholetale/mixins/current-instance';

export default AuthenticateRoute.extend(CurrentInstanceMixin, {
  model() {
    this._super(...arguments);
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
      selected: this.getCurrentInstance()
    };
  }
});
