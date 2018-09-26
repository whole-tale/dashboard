import Ember from 'ember';
import config from 'wholetale/config/environment';

export default Ember.Controller.extend({
  init() {
    //var token = Ember.$.getJSON('https://girder.wholetale.org/api/v1/token/current');
    //alert("Token is " + JSON.stringify(token));
  },
  authProvider: config.authProvider,
  actions: {
    login: function(url) {
      let content = Ember.$.ajax(url);
      window.open(url, "_self");
      console.log(content);
    },
  }
});
