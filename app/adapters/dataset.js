import Ember from 'ember';
import DS from 'ember-data';
import config from '../config/environment';


export default DS.RESTAdapter.extend({
    authRequest: Ember.inject.service(),

    query(store, type, query, recordArray) {
        let url = this.buildURL(type.modelName, null, null, 'query', query);
        url = config.apiUrl + url;

        if (this.sortQueryParams) {
            query = this.sortQueryParams(query);
        }

        return this.get('authRequest').send(url, {method: 'GET'});
    },

    urlForCreate(query, modelName) {
        let url = this._super(query, modelName);

        url += "register";

        return url;
    },
});