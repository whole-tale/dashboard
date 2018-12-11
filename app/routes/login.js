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
    var redirectUrl = host;
    // Append return route if one exists, ignore login route
    if (pathSuffix && pathSuffix.indexOf('/login') === -1) {
      redirectUrl += pathSuffix
    }
    // Append to query string if one exists, otherwise add one
    if (redirectUrl.indexOf("?") !== -1) {
      redirectUrl += "&token={girderToken}"
    } else {
      redirectUrl += "?token={girderToken}"
    }
    let url = config.apiUrl + '/oauth/provider?redirect=' + encodeURIComponent(redirectUrl);

    return Ember.$.getJSON(url);
  }
});
