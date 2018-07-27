import Service from '@ember/service';
import config from '../config/environment';
import {
  inject as service
} from '@ember/service';

export default Service.extend({
  store: service(),
  authRequest: service(),

  // -----------------------------------------------
  // Get access control settings for the given object
  fetch(object) {
    let requestOptions = {
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      }
    };

    let url = `${config.apiUrl}/${object._modelType}/${object._id}/access`;

    return this.get('authRequest').send(url, requestOptions);
  },

  // --------------------------------------------------
  // Update access control settings for the given object
  update(object, granted, options) {
    options = options || {
      publicFlags: [],
      recurse: true,
      progress: false
    };

    this.get('store').findRecord(object._modelType, object._id)
      .then(record => {
        record.set('public', object.public);
        record.save();
      });

    let requestOptions = {
      method: 'PUT',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        access: JSON.stringify(granted),
        public: object.public,
        publicFlags: options.publicFlags,
        recurse: options.recurse,
        progress: options.progress
      }
    };

    let url = `${config.apiUrl}/${object._modelType}/${object._id}/access`;

    return this.get('authRequest').send(url, requestOptions);
  },
});
