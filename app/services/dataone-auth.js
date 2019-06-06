import Service from '@ember/service';
import { inject as service } from '@ember/service';
 export default Service.extend({
  tokenHandler: service('token-handler'),
  store: service(),
  authRequest: service(),
  isAuthenticated: true,

    /**
     * Queries the DataONE `token` endpoint for the jwt. When a user signs into
     * DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
     * found, then the response will be empty. Otherwise the jwt is returned.
     *
     * @method getDataONEJWT
     * @param dataoneEndpoint The Coordinating node address (with the version)
    */
   getDataONEJWT(dataoneEndpoint) {
    let xmlHttp = new XMLHttpRequest();

    dataoneEndpoint = this.getPortalEndpoint(dataoneEndpoint)+'/token'
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

    /**
     * Takes a coordinating node and returns the portal endpoint.
     *
     * @method getPortalEndpoint
     * @param coordinatingNode The Coordinating node address (with the version)
    */
  getPortalEndpoint(coordinatingNode) {
    return coordinatingNode.replace('cn/v2', 'portal')
  }
 });