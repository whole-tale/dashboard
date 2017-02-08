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
                // console.log(userJS);
                let userObj = JSON.parse(userJS);
                let userRec = self.get('store').createRecord('user', userObj);
                // console.log("User not is null in api call");
                localStorage.currentUserID = userRec.get('_id'); // store logged in user locally

                return userRec;
            }
        })
        .catch(() => {
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

    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/token/session';
    var request = new XMLHttpRequest();

    var self = this;
    request.open('DELETE', url, false);
    request.setRequestHeader("Girder-Token", token);

    request.send();

    if (request.status === 200) {
      self.get('tokenHandler').releaseWholeTaleCookie();
      localStorage.currentUserID = null;
    } else {
      //alert("Could not log out!");
    }
  }

});
