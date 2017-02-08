import Ember from 'ember';
import DS from 'ember-data';

import config from '../config/environment';

export default DS.RESTAdapter.extend({
  tokenHandler: Ember.inject.service("token-handler"),

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
