import Ember from 'ember';
import { inject as service } from '@ember/service';
import config from '../config/environment';

export default Ember.Route.extend({
  queryParams: {
    rd: {
      refreshModel: true
    }
  },
  routerService: service('-routing'),
  model: function(params) {
    // console.log("In login route");
    var http = location.protocol;
    var slashes = http.concat("//");
    var ishttp = (location.port === '') || (location.port === 80) || (location.port === 443);
    var host = slashes.concat(window.location.hostname) + (ishttp? "": ':'+location.port);
    var pathSuffix = decodeURIComponent(params.rd) || "";
    // Append to query string if on exists, otherwise add one
    if (pathSuffix.indexOf("?") !== -1) {
      pathSuffix += "&token={girderToken}"
    } else {
      pathSuffix += "?token={girderToken}"
    }
    var redirectUrl = host + pathSuffix;
    let url = config.apiUrl + '/oauth/provider?redirect=' + encodeURIComponent(redirectUrl);

    return Ember.$.getJSON(url);
  }
});
