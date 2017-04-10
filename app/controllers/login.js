import Ember from 'ember';

export default Ember.Controller.extend({
  init() {
    //var token = Ember.$.getJSON('https://girder.wholetale.org/api/v1/token/current');
    //alert("Token is " + JSON.stringify(token));
  },
  actions: {
    login: function(url) {
      var content = Ember.$.ajax(url);
      window.open(url, "_self");
      console.log(content);
    },
  }
});
