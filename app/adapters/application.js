import Ember from 'ember';
import DS from 'ember-data';

import config from '../config/environment';

export default DS.RESTAdapter.extend({
    tokenHandler: Ember.inject.service("token-handler"),
    authRequest: Ember.inject.service(),

    host: config.apiHost,
    namespace: config.apiPath,
    primaryKey: '_id',

    headers: Ember.computed(function() {
        return {
            'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken()
            //      'Girder-Token': Ember.get(document.cookie.match(/girderToken\=([^;]*)/), '1'),  };
        };
    }),

    // Some Girder APIs need query params in the url to update models...
    // This functions allows us to pass query params to save() like this:
    // model.save({adapterOptions:{queryParams:{}}});
    // where queryParams is a hash object.
    urlForUpdateRecord(id, modelName, snapshot) {
        let url = this._super(id, modelName, snapshot);
        let queryParams = snapshot.adapterOptions.queryParams; 
        if(snapshot.adapterOptions.copy) {
            url += "/copy";
        }
        if(queryParams) {
            let q = this.buildQueryParams(queryParams);
            return url+"?"+q;
        }
        return url;
    },

    urlForCreateRecord(modelName, snapshot) {
        let url = this._super(modelName, snapshot);
        let queryParams = snapshot.adapterOptions.queryParams;
        if(queryParams) {
            let q = this.buildQueryParams(queryParams);
            url += "?"+q;
        }
        return url;
    },

    urlForQuery(query, modelName) {
        let url = this._super(query, modelName);

        if(query.adapterOptions) {
            if(query.adapterOptions.registered) {
                url += "/registered";
            }
            else if(query.adapterOptions.icon) {
                let queryParams = snapshot.adapterOptions.queryParams;
                url += "/icon";
                if(queryParams) {
                    let q = this.buildQueryParams(queryParams);
                    url += "?"+q;
                }
            }
        }

        return url;
    },

    // Ember likes "204 no content" responses when making a DELETE request.
    // But Girder returns 200, so we have to override the response to prevent
    // ember from throwing an exception when deleting a model.
    deleteRecord(store, type, snapshot) {
        let response = this._super(store, type, snapshot);
        return null;
    },

    updateRecord(store, type, snapshot) {
        if(snapshot.adapterOptions.copy) {
            let data = {};
            let serializer = store.serializerFor(type.modelName);

            serializer.serializeIntoHash(data, type, snapshot);

            let id = snapshot.id;
            let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

            return this.get('authRequest').send(url, {method: "POST", data: data});
        }
        return this._super(...arguments);
    },

    methodForRequest(params) {
        if (params.requestType === 'createRecord') { return 'PUT'; }
        return this._super(params);
    },

    buildQueryParams(queryParams) {
        let keys = Object.keys(queryParams);
        let q = keys.reduce((_q, key) => {
            _q.push(key+"="+queryParams[key]);
            return _q;
        }, []);
        return q.join('&');
    }
});

//.volatile()
