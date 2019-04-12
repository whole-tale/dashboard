import Service from '@ember/service';
import { inject as service } from '@ember/service';
import config from '../config/environment';

export default Service.extend({
  tokenHandler: service('token-handler'),
  store: service(),
  authRequest: service(),
  dataoneJWT: '',
  
  /*
    Queries the DataONE `token` endpoint for the jwt. When a user signs into
    DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
    found, then the response will be empty. Otherwise the jwt is returned.
  */
  getDataONEJWT() {
    if (this.dataoneJWT) {
      return this.dataoneJWT;
    }
   
     // Use the XMLHttpRequest to handle the request
    let xmlHttp = new XMLHttpRequest();
    // Open the request to the the token endpoint, which will return the jwt if logged in
    let dataoneEndpoint = 'https://cn.dataone.org/portal/token'
    if (config.dev) {
      dataoneEndpoint = 'https://cn-stage-2.test.dataone.org/portal/token'
    }
    xmlHttp.open("GET", dataoneEndpoint, false);
    // Set the response content type
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    // Let XMLHttpRequest know to use cookies
    xmlHttp.withCredentials = true;
    xmlHttp.send(null);
    this.set('dataoneJWT', xmlHttp.responseText);
    return this.dataoneJWT
  },
  
  hasD1JWT()  {
    return this.dataoneJWT ? true : false;
  },
});