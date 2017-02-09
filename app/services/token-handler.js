import Ember from 'ember';


export default Ember.Service.extend({

  getCookie : function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },

  deleteCookie : function ( name, path, domain ) {
    if( this.getCookie( name ) ) {
      document.cookie = name + "=" +
        ((path) ? ";path="+path:"")+
        ((domain)?";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  },

  getWholeTaleAuthToken: function() {
    return this.getCookie('girderToken');
  },

  releaseWholeTaleCookie: function () {
    return this.deleteCookie('girderToken');
  }
});
