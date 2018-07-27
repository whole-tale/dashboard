import config from '../config/environment';
import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  tokenHandler: service('token-handler'),
  store: service(),
  authRequest: service(),

  isAuthenticated: true,

  getCurrentUserFromServer: function () {
    let self = this;

    let url = config.apiUrl + '/user/me';
    return this.get('authRequest').send(url)
      .then(userJS => {
        if ((userJS == null) || (userJS === "") || (userJS === "null")) {
          // console.log("User is null in api call");
          return null;
        } else {
          let userRec = self.get('store').createRecord('user', userJS); //BUG: this call returns an empty object
          localStorage.currentUserID = userJS._id; // store logged in user locally
          return userRec;
        }
      })
      .catch(() => {
        // console.log(e);
        return null;
      });
  },

  resetCurrentUser() {
    localStorage.currentUserID = null;
  },

  getCurrentUser() {
    let userID = localStorage.currentUserID;
    if (!userID || (userID === "null") || (userID === "") || (userID === "undefined")) {
      return null;
    }

    return this.get('store').find('user', userID);
  },

  getCurrentUserID() {
    return localStorage.currentUserID;
  },

  logoutCurrentUser() {
    let self = this;

    let url = config.apiUrl + '/token/session';
    let options = {
      method: 'DELETE'
    };

    this.get('authRequest').send(url, options)
      .catch(() => {
        // console.log("ERROR LOGGING OUT");
        // console.log(e);
      })
      .finally(() => {
        self.get('tokenHandler').releaseWholeTaleCookie();
        localStorage.currentUserID = null;
        localStorage.clear();
      });
  }

});
