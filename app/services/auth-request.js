import Ember from 'ember';
import RSVP from 'rsvp';
import config from '../config/environment';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    ////////////////////////////////////////////////////////////////////////////
    authenticatedAJAX: function(options) {
        if(config.authorizationType === 'cookie') {
            Ember.merge(options, {
                xhrFields: {
                    withCredentials: true
                }
            });
        }
        return Ember.$.ajax(options);
    },

    ////////////////////////////////////////////////////////////////////////////
    send: function(url, options) {
        let self = this;
        options = options || {};

        let headers = {};

        options.headers = _.merge(options.headers || {}, headers);

        return new RSVP.Promise((resolve, reject) => {
            options.url = url;
            let deferred = self.authenticatedAJAX(options);
            deferred.done((rep) => resolve(rep));
            deferred.fail((_, __, error) => reject(error));
        });
    }
});
