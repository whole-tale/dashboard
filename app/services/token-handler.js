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
        let s = c.substring(name.length, c.length);
        return s;
      }
    }

    //cookie not found, look for token in url
    let token, matchInfo = /token=(.*)/.exec(document.location.search);
    if(matchInfo) {
        token = matchInfo[1] || null;
        if(token) this.setCookie('girderToken', token);
//        var location = this.get('router.url');
  //      window.location.href = location.split('?')[0];

        return token;
    }

    return null;
  },

  setCookie : function(cname, value, path, domain, expiry) {
    let d = new Date();
    d.setTime(d.getTime() + ((expiry||180)*24*60*60*1000));
    let expires = d.toUTCString();

    document.cookie = cname + "=" + value + ";" +
        ((path) ? ";path="+path:"")+
        ((domain)?";domain="+domain:"") +
        ";expires=" + expires;
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
