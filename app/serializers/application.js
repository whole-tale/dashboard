import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  primaryKey: '_id',

  normalizeQueryResponse(store, primaryModelClass, payload, id, requestType) {
    if (payload.hasOwnProperty("folder")) {
      payload = payload['folder'];
    }

    return this._super(store, primaryModelClass, payload, id, requestType);
  },

  normalizeFindRecordResponse(store, primaryModelClass, payload, id, requestType) {
    if (!payload.id) {
      payload[this.primaryKey] = id;
    }
    return this._super(store, primaryModelClass, payload, id, requestType);
  }

});
