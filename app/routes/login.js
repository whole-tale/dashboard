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
    console.log("Route: ", this.routerService);
    var pathSuffix = params.rd || "";
    let url = config.apiUrl + '/oauth/provider?redirect=' + host + pathSuffix + "%3Ftoken%3D%7BgirderToken%7D";

    return Ember.$.getJSON(url);
  }
});
