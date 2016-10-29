import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: 'https://girder.wholetale.org',
  namespace: '/api/v1',
  primaryKey: '_id'
});

