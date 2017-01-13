import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({
  tokenHandler: Ember.inject.service("token-handler"),
  isAuthenticated: true,
  store: Ember.inject.service('store'),

  getCurrentUserFromServer:function () {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/user/me';
    var request = new XMLHttpRequest();
    var _this=this;
    request.open('GET', url, false);
    request.setRequestHeader("Girder-Token", token);

    request.send();

    if (request.status === 200) {
      var userJS = request.responseText.trim();
      if ((userJS == null) || (userJS === "") || (userJS=="null")) {
        console.log("User is null in api call");
        return null;
      } else {
        console.log(userJS);
        var userObj = JSON.parse(userJS);
        var userRec = _this.get('store').createRecord('user', userObj);
        console.log("User not is null in api call");
        localStorage.currentUserID = userRec.get('_id'); // store logged in user locally

        return userRec;
      }
    }

    return null;

  },

  getCurrentUser() {
    var userID = localStorage.currentUserID;
    if ((userID == null) || (userID === "") || (userID === "undefined")) return null;

    return this.get('store').find('user', userID);
  },

  logoutCurrentUser() {

    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/token/session';
    var request = new XMLHttpRequest();

    var _this = this;
    request.open('DELETE', url, false);
    request.setRequestHeader("Girder-Token", token);

    request.send();

    if (request.status === 200) {
      this.get('tokenHandler').releaseWholeTaleCookie();
      localStorage.currentUserID = null;
    } else {
      //alert("Could not log out!");
    }
  }

});
