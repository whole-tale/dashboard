import Ember from 'ember';
import RSVP from 'rsvp';
import config from '../config/environment';
import _ from 'lodash/lodash';

export default Ember.Service.extend({
    tokenHandler: Ember.inject.service(),

    ////////////////////////////////////////////////////////////////////////////
    authenticatedAJAX: function(options) {
        if(config.authorizationType === 'cookie') {
            Ember.merge(options, {
                xhrFields: {
                    withCredentials: true
                }
            });
        }
        else {
            let token = this.get('tokenHandler').getWholeTaleAuthToken();

            options.headers = Ember.merge(options.headers, {
                'Girder-Token': token
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
            deferred.done(rep => resolve(rep));
            deferred.fail(error => reject(error));
        });
    }
});
