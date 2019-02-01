import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';
import _ from 'lodash';

import config from '../config/environment';
import buildQueryParamsMixin from 'wholetale/mixins/build-query-params';

export default DS.RESTAdapter.extend(buildQueryParamsMixin, {
    tokenHandler: service('token-handler'),
    notificationHandler: service('notification-handler'),
    authRequest: service(),
    host: config.apiHost,
    namespace: config.apiPath,
    primaryKey: '_id',

    headers: computed(function () {
        return {
            'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken()
            // 'Girder-Token': Ember.get(document.cookie.match(/girderToken\=([^;]*)/), '1'),  };
        };
    }).volatile(),

    // Some Girder APIs need query params in the url to update models...
    // This functions allows us to pass query params to save() like this:
    // model.save({adapterOptions:{queryParams:{}}});
    // where queryParams is a hash object.
    urlForUpdateRecord(id, modelName, snapshot) {
        let url = this._super(id, modelName, snapshot);
        let queryParams = _.get(snapshot, "adapterOptions.queryParams");

        if (_.get(snapshot, "adapterOptions.copy")) {
            url += "/copy";
        }
        if (_.get(snapshot, "adapterOptions.appendPath")) {
            url += "/" + snapshot.adapterOptions.appendPath;
        }
        if (queryParams) {
            let q = this.buildQueryParams(queryParams);
            return url + "?" + q;
        }

        return url;
    },

    urlForFindRecord(id, modelName, snapshot) {
        let url = this._super(...arguments);
        let appendPath = _.get(snapshot, 'adapterOptions.appendPath');
        if (appendPath) {
            url += "/" + snapshot.adapterOptions.appendPath;
        }
        let insertPath = _.get(snapshot, 'adapterOptions.insertPath');
        if (insertPath) {
            url = url.replace(id, `${insertPath}/${id}`);
        }
        let queryParams = _.get(snapshot, 'adapterOptions.queryParams');
        if (queryParams) {
            let q = this.buildQueryParams(queryParams);
            return url + "?" + q;
        }
        return url;
    },

    urlForFindAll(modelName, snapshot) {
        let url = this._super(...arguments);
        let appendPath = _.get(snapshot, 'adapterOptions.appendPath');
        if (appendPath) {
            url += "/" + snapshot.adapterOptions.appendPath;
        }
        let queryParams = _.get(snapshot, 'adapterOptions.queryParams');
        if (queryParams) {
            let q = this.buildQueryParams(queryParams);
            return url + "?" + q;
        }
        return url;
    },

    urlForCreateRecord(modelName, snapshot) {
        let url = this._super(modelName, snapshot);
        let queryParams = _.get(snapshot, 'adapterOptions.queryParams');
        if (_.get(snapshot, "adapterOptions.copy")) {
            url += `/${snapshot.adapterOptions.copy}/copy`;
        }
        if (_.get(snapshot, "adapterOptions.appendPath")) {
            url += "/" + snapshot.adapterOptions.appendPath;
        }
        if (queryParams) {
            let q = this.buildQueryParams(queryParams);
            url += "?" + q;
        }
        return url;
    },

    query(store, type, query) {
        var url = this.buildURL(type.modelName, null, null, 'query', query);
        delete query.adapterOptions;

        if (this.sortQueryParams) {
            query = this.sortQueryParams(query);
        }

        return this.get('authRequest').send(url, {
            method: 'GET',
            data: query
        });
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

    // Ember likes "204 no content" responses when making a DELETE request.
    // But Girder returns 200, so we have to override the response to prevent
    // ember from throwing an exception when deleting a model.
    deleteRecord(store, type, snapshot) {
        let response = this._super(store, type, snapshot);
        return null;
    },

    updateRecord(store, type, snapshot) {
        let data = {};
        let serializer = store.serializerFor(type.modelName);

        serializer.serializeIntoHash(data, type, snapshot);

        let id = snapshot.id;
        let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

        if (_.get(snapshot, "adapterOptions.copy")) {
            return this.get('authRequest').send(url, {
                method: "POST",
                data: data
            });
        }

        // NOTE(Adam): The /dm endpoint does not match what the ember REST adapter expects.
        //             For example, Ember adapter uses PATCH to update models. And Ember also expects a json body but /dm uses query params. 
        //             And the endpoint uses /dm/session/{id} instead of /dm/{id}. 
        //             For these reasons, I must override the Ember adapter and customize the update function for the /dm endpoint.
        if (type.modelName === 'dm') {
            url = url.replace(id, `session/${id}`);
            let q = '';
            try {
                q = this.buildQueryParams({ dataSet: JSON.stringify(snapshot.record.dataSet) });
            } catch (e) {
                throw new Error("could not save dataset back to the session.");
            }
            url += '?' + q;
            try {
              return this.get('authRequest').send(url, {
                  method: "PUT"
              });
            } catch(error) {
              let notifier = this.get('notificationHandler');
              let notification = { message: error || 'Your update operation has failed', header: "Failed update operation" };
              notifier.pushNotification(notification);
            }
        }
        try {
          return this._super(...arguments);
        } catch(error) {
          let notifier = this.get('notificationHandler');
          let notification = { message: error || 'Your update operation has failed', header: "Failed update operation" };
          notifier.pushNotification(notification);
        }
    },

    createRecord(store, type, snapshot) {
        let data = {};
        let serializer = store.serializerFor(type.modelName);
        let url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

        serializer.serializeIntoHash(data, type, snapshot, {
            includeId: true
        });

        //Prune all nulls from the object
        data = Object.keys(data).reduce((acc, key) => {
            if (data[key] !== null) acc[key] = data[key];
            return acc;
        }, {});

        return this.get('authRequest').send(url, {
            method: "POST",
            data: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            }
        });
    },

    methodForRequest(params) {
        if (params.requestType === 'createRecord') {
            return 'PUT';
        }
        return this._super(params);
    },
});
