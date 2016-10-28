import RESTAdapter from 'ember-data/adapters/rest';

export default DS.RESTAdapter.extend({
  host: 'https://girder.wholetale.org',
  namespace: '/api/v1'
});

