import Ember from 'ember';
import DS from 'ember-data';

import config from '../config/environment';

export default DS.RESTAdapter.extend({
  tokenHandler: Ember.inject.service("token-handler"),

  // Some Girder APIs need query params in the url to update models...
  // This functions allows us to pass query params to save() like this:
  // model.save({adapterOptions:{queryParams:{}}});
  // where queryParams is a hash object.
  urlForUpdateRecord(id, modelName, snapshot) {
    let url = this._super(id, modelName, snapshot);
    if(snapshot.adapterOptions.queryParams) {
        let queryParams = snapshot.adapterOptions.queryParams;
        let keys = Object.keys(queryParams);
        let q = keys.reduce((_q, key) => {
            _q.push(key+"="+queryParams[key]);
            return _q;
        }, []);
        return url + "?"+q.join('&');
    }
    return url;
  },

  methodForRequest(params) {
//      console.log("MethodForRequest being called...");
  //    console.log(params);
      if (params.requestType === 'createRecord') { return 'PUT'; }
      return this._super(params);
    },
  host: config.apiHost,
  namespace: config.apiPath,
  primaryKey: '_id',
  headers: Ember.computed(function() {
    return {
      'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken()
//      'Girder-Token': Ember.get(document.cookie.match(/girderToken\=([^;]*)/), '1'),  };
    };
  })
});

//.volatile()
