import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import config from '../config/environment';
import $ from 'jquery';

export default Route.extend({
  queryParams: {
    rd: {
      refreshModel: true
    }
  },
  routerService: service('-routing'),
  model(params) {
    // console.log("In login route");
    let http = location.protocol;
    let slashes = http.concat('//');
    let ishttp = (location.port === '') || (location.port === 80) || (location.port === 443);
    let host = slashes.concat(window.location.hostname) + (ishttp ? '' : ':' + location.port);
    let pathSuffix = decodeURIComponent(params.rd) || '';
    let redirectUrl = host;
    // Append return route if one exists, ignore login route
    if (pathSuffix && pathSuffix.indexOf('/login') === -1) {
      redirectUrl += pathSuffix;
    }
    // Append to query string if one exists, otherwise add one
    if (redirectUrl.indexOf('?') !== -1) {
      redirectUrl += '&token={girderToken}';
    } else {
      redirectUrl += '?token={girderToken}';
    }
    let url = config.apiUrl + '/oauth/provider?redirect=' + encodeURIComponent(redirectUrl);

    return $.getJSON(url);
  }
});
