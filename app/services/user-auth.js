import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({
  tokenHandler: Ember.inject.service("token-handler"),
  store: Ember.inject.service('store'),
  authRequest: Ember.inject.service(),

  isAuthenticated: true,

  getCurrentUserFromServer:function () {
    let self = this;
    let token = this.get('tokenHandler').getWholeTaleAuthToken();

    let url = config.apiUrl + '/user/me';
    let options = {
        headers: {
            'Girder-Token': token
        }
    };

    return this.get('authRequest').send(url, options)
        .then(userJS => {
            if ((userJS == null) || (userJS === "") || (userJS==="null")) {
                // console.log("User is null in api call");
                return null;
            }
            else {
                let userRec = self.get('store').createRecord('user', userJS);   //BUG: this call returns an empty object
                // console.log("User not is null in api call");
                localStorage.currentUserID = userJS._id; // store logged in user locally

                return userRec;
            }
        })
        .catch(e => {
            // console.log(e);
            return null;
        });
  },

  getCurrentUser() {
    var userID = localStorage.currentUserID;
    if ((userID === "null") || (userID == null) || (userID === "") || (userID === "undefined")) {
      return null;
    }

    return this.get('store').find('user', userID);
  },

  logoutCurrentUser() {
    let self  = this;
    let token = this.get('tokenHandler').getWholeTaleAuthToken();

    let url = config.apiUrl + '/token/session';
    let options = {
        method: 'DELETE',
        headers: {
            'Girder-Token': token
        }
    };

    this.get('authRequest').send(url, options)
        .then(() => {
            self.get('tokenHandler').releaseWholeTaleCookie();
            localStorage.currentUserID = null;
        })
        .catch(() => {
            //alert("Could not log out!");
        });
  }

});
