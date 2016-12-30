import DS from 'ember-data';

import config from '../config/environment';

export default DS.RESTAdapter.extend({
    methodForRequest(params) {
//      console.log("MethodForRequest being called...");
  //    console.log(params);
      if (params.requestType === 'createRecord') { return 'PUT'; }
      return this._super(params);
    },
  host: config.apiHost,
  namespace: config.apiPath,
  primaryKey: '_id'
});

