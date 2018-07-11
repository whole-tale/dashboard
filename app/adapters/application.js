import Ember from 'ember';
import DS from 'ember-data';
import _ from 'lodash';

import config from '../config/environment';
import buildQueryParamsMixin from 'wholetale/mixins/build-query-params';

export default DS.RESTAdapter.extend(buildQueryParamsMixin, {
  tokenHandler: Ember.inject.service("token-handler"),
  authRequest: Ember.inject.service(),
  host: config.apiHost,
  namespace: config.apiPath,
  primaryKey: '_id',

  headers: Ember.computed(function () {
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
    let queryParams = _.get(snapshot, 'adapterOptions.queryParams');
    if (queryParams) {
      let q = this.buildQueryParams(queryParams);
      return url + "?" + q;
    }
    return url;
  },

  urlForFindAll(modelName, snapshot) {
    let url = this._super(...arguments);
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
      if (query.adapterOptions.registered) {
        url += "/registered";
      } else if (query.adapterOptions.icon) {
        let queryParams = query.adapterOptions.queryParams;
        if (queryParams) {
          let q = this.buildQueryParams(queryParams);
          url += "?" + q;
        }
        url += "/icon";
      } else if (query.adapterOptions.appendPath) {
        url += "/" + query.adapterOptions.appendPath;
        let queryParams = query.adapterOptions.queryParams;
        if (queryParams) {
          let q = this.buildQueryParams(queryParams);
          url += "?" + q;
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
    if (_.get(snapshot, "adapterOptions.copy")) {
      let data = {};
      let serializer = store.serializerFor(type.modelName);

      serializer.serializeIntoHash(data, type, snapshot);

      let id = snapshot.id;
      let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

      return this.get('authRequest').send(url, {
        method: "POST",
        data: data
      });
    }

    return this._super(...arguments);
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
