import Ember from 'ember';
import RSVP from 'rsvp';
import DS from 'ember-data';

import config from '../config/environment';
import buildQueryParamsMixin from 'wholetale/mixins/build-query-params';

export default DS.RESTAdapter.extend(buildQueryParamsMixin, {
    tokenHandler: Ember.inject.service("token-handler"),
    authRequest: Ember.inject.service(),

    host: config.apiHost,
    namespace: config.apiPath,

    primaryKey: "_id",

    query(store, type, query) {
        let url = this.buildURL(type.modelName, null, null, 'query', query);

        console.log("sending request for sils ... ");
        return new RSVP.Promise(resolve => resolve([{ _id: 1, _modelType: "sils", icon: "http://lorempixel.com/400/400/abstract/" }]));

        //TODO: uncomment this after sils endpoint working
        // return this.get('authRequest').send(url, {headers:{'content-type':'application/json'}});
    },

    urlForQuery(query, modelName) {
        let url = this._super(query, modelName);

        if (query) {
            query.w = query.w || config.taleIconWidth;
            query.h = query.h || config.taleIconHeight;
            let q = this.buildQueryParams(query);
            url += "?" + q;
        }

        return url;
    }
});