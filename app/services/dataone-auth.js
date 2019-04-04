import Service from '@ember/service';

// TODO: Eventually use production DataONE: https://cn.dataone.org/portal/token
const dataoneEndpoint = 'https://cn-stage-2.test.dataone.org/portal/token'

export default Service.extend({
  dataoneJWT: '',
 
  /** Fetch from DataONE's token endpoint, which will return the jwt if logged in */
  getDataONEJWT() {
    let jwt = this.get('dataoneJWT');
    if (jwt && jwt !== '') {
      // TODO: is this an issue for users who never refresh the page?
      return jwt;
    }
    
    /*
    Queries the DataONE `token` endpoint for the jwt. When a user signs into
    DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
    found, then the response will be empty. Otherwise the jwt is returned.
    */
     // Use the XMLHttpRequest to handle the request
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", dataoneEndpoint, false);
    // Set the response content type
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    // Let XMLHttpRequest know to use cookies
    xmlHttp.withCredentials = true;
    xmlHttp.send(null);
    this.set('dataoneJWT', xmlHttp.responseText);
    
    return this.get('dataoneJWT');
  },
  
  rerouteToDataoneLogin(taleId) {
    let callback = `${this.get('wholeTaleHost')}/run/${taleId}?auth=true`;
    let orcidLogin = 'https://cn-stage-2.test.dataone.org/portal/oauth?action=start&target=';
    window.location.href = orcidLogin + callback;
  },
  
   hasD1JWT()  {
    let jwt = this.getDataONEJWT();
    return jwt ? true : false;
  },
});