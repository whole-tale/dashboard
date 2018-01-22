import Ember from 'ember';
import config from '../config/environment';

export default Ember.Route.extend({
  model: function(params) {
    // console.log("In login route");
    var http = location.protocol;
    var slashes = http.concat("//");
    var ishttp = (location.port === '') || (location.port === 80) || (location.port === 443);
    // Check if the user is coming from the login screen. If they are, we don't want to redirect them back to it.
    var islogin = (window.location.pathname == '/\login');
    var host = slashes.concat(window.location.hostname) +
     (ishttp? "": ':'+location.port) +
      (islogin? "": encodeURIComponent(window.location.pathname));
    let url = config.apiUrl + '/oauth/provider?redirect=' + host + "%3Ftoken%3D%7BgirderToken%7D";

    return Ember.$.getJSON(url);
  }
});
