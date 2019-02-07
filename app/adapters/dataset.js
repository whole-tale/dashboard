import Ember from 'ember';
import DS from 'ember-data';
import config from '../config/environment';
import buildQueryParamsMixin from 'wholetale/mixins/build-query-params';

export default DS.RESTAdapter.extend(buildQueryParamsMixin, {
    tokenHandler: Ember.inject.service("token-handler"),
    authRequest: Ember.inject.service(),

    host: config.apiHost,
    namespace: config.apiPath,

    headers: Ember.computed(function() {
        return {
            'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken(),
            //      'Girder-Token': Ember.get(document.cookie.match(/girderToken\=([^;]*)/), '1'),  };
        };
    }),

    query(store, type, query, recordArray) {
        let url = this.buildURL(type.modelName, null, null, 'query', query);
        delete query.adapterOptions;

        if (this.sortQueryParams) {
            query = this.sortQueryParams(query);
        }

        return this.get('authRequest').send(url, { method: 'GET', data: query });
    },
    
    urlForQuery(query, modelName) {
        let url = this._super(query, modelName);

        if (query.adapterOptions) {
            if (query.adapterOptions.appendPath) {
                url += "/" + query.adapterOptions.appendPath;
            }
            if (query.adapterOptions.queryParams) {
                let q = this.buildQueryParams(query.adapterOptions.queryParams);
                url += "?" + q;
            }
        }
        return url;
    },

    urlForUpdateRecord(id, modelName, snapshot) {
        let url = this._super(id, modelName, snapshot);

        let queryParams = snapshot.adapterOptions.queryParams;

        if (queryParams) {
            let q = this.buildQueryParams(queryParams);
            return url + "?" + q;
        }
        return url;
    },

    updateRecord(store, type, snapshot) {
        if (snapshot.adapterOptions.copy) {
            let data = snapshot.adapterOptions.data || {};
            let serializer = store.serializerFor(type.modelName);

            serializer.serializeIntoHash(data, type, snapshot);

            let id = snapshot.id;
            let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');
            return this.get('authRequest').send(url, { method: "PUT", headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(data) });
        }
        return this._super(...arguments);
    },

    urlForCreate(query, modelName) {
        let url = this._super(query, modelName);

        url += "register";

        return url;
    }
});