import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  methodForRequest({ requestType }) {
    if (requestType === "updateRecord") {
      return "PUT";
    }
  },
  host: 'https://girder.wholetale.org',
  namespace: '/api/v1',
  primaryKey: '_id'
});

