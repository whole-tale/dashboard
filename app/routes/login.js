import Ember from 'ember';
import config from '../config/environment';

export default Ember.Route.extend({
  model: function(params) {
    console.log("In login route");
    var http = location.protocol;
    var slashes = http.concat("//");
    var ishttp = (location.port === '') || (location.port === 80) || (location.port === 443);
    var host = slashes.concat(window.location.hostname) + (ishttp? "": ':'+location.port);
    let url = config.apiUrl + '/oauth/provider?redirect=' + host;
    return Ember.$.getJSON(url);
  }
});
