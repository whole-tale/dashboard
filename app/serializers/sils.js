import DS from 'ember-data';

/* Mock SILS */
//TODO: Remove or comment out this function after SILS endpoint is working
export default DS.JSONSerializer.extend({
    primaryKey: '_id',
    // normalizeQueryResponse(store, primaryModelClass, payload, id, requestType) {
    //     return this._super(...arguments);
    // },
});