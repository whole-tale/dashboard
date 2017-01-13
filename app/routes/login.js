import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var http = location.protocol;
    var slashes = http.concat("//");
    var ishttp = (location.port === '') || (location.port === 80) || (location.port === 443);
    var host = slashes.concat(window.location.hostname) + (ishttp? "": ':'+location.port);
    var url = 'https://girder.wholetale.org/api/v1/oauth/provider?redirect=' + host;

    return Ember.$.getJSON(url);
  }

});
