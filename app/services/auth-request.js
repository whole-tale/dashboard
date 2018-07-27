import RSVP from 'rsvp';
import config from '../config/environment';
import _ from 'lodash';
import $ from 'jquery';
import Service from '@ember/service';
import {
  inject as service
} from '@ember/service';
import {
  merge
} from '@ember/polyfills';

export default Service.extend({
  tokenHandler: service(),

  ////////////////////////////////////////////////////////////////////////////
  authenticatedAJAX(options) {
    if (config.authorizationType === 'cookie') {
      merge(options, {
        xhrFields: {
          withCredentials: true
        }
      });
    } else {
      let token = this.get('tokenHandler').getWholeTaleAuthToken();

      options.headers = merge(options.headers, {
        'Girder-Token': token
      });
    }

    return $.ajax(options);
  },

  ////////////////////////////////////////////////////////////////////////////
  send: function (url, options) {
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
