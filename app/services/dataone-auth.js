import Service from '@ember/service';
import { inject as service } from '@ember/service';
 export default Service.extend({
  tokenHandler: service('token-handler'),
  store: service(),
  authRequest: service(),
  isAuthenticated: true,
  devCN: 'https://cn-stage-2.test.dataone.org/portal',
  prodCN: 'https://cn.dataone.org/portal',

    /**
     * Queries the DataONE `token` endpoint for the jwt. When a user signs into
     * DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
     * found, then the response will be empty. Otherwise the jwt is returned.
     *
     * @method getDataONEJWT
     * @param isProduction Flag set to true when production should be interfaced
    */
   getDataONEJWT(isProduction) {
    let xmlHttp = new XMLHttpRequest();
    let dataoneEndpoint = this.devCN
    if (isProduction) {
      dataoneEndpoint = this.prodCN
    }
    dataoneEndpoint+='/token'
    console.log('From getDataONEJWT', dataoneEndpoint)
    xmlHttp.open("GET", dataoneEndpoint, false);
    // Set the response content type
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    // Let XMLHttpRequest know to use cookies
    xmlHttp.withCredentials = true;
    xmlHttp.send(null);
    return xmlHttp.responseText;
  },


   hasD1JWT()  {
    let jwt = this.getDataONEJWT();
    return jwt ? true : false;
  },

  getEndpoint(isProduction) {
    let dataoneEndpoint = this.devCN;
    if (isProduction) {
      dataoneEndpoint = this.prodCN;
    }
    return dataoneEndpoint;
  }
 });