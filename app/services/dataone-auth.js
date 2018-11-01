import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
 export default Service.extend({
  tokenHandler: service('token-handler'),
  store: service(),
  authRequest: service(),
   isAuthenticated: true,
   getDataONEJWT() {
    /*
    Queries the DataONE `token` endpoint for the jwt. When a user signs into
    DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
    found, then the response will be empty. Otherwise the jwt is returned.
    */
     // Use the XMLHttpRequest to handle the request
    let xmlHttp = new XMLHttpRequest();
    // Open the request to the the token endpoint, which will return the jwt if logged in
    xmlHttp.open("GET", 'https://cn-stage-2.test.dataone.org/portal/token', false);
    // Set the response content type
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    // Let XMLHttpRequest know to use cookies
    xmlHttp.withCredentials = true;
    xmlHttp.send(null);
    return xmlHttp.responseText;
  },
   hasD1JWT: computed('model.taleId', function () {
    let jwt = this.getDataONEJWT();
    return jwt ? true : false;
  }),
 });