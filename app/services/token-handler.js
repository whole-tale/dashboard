import Service from '@ember/service';

export default Service.extend({

  getCookie: function (cname) {
    let  name = cname + "=";
    let  decodedCookie = decodeURIComponent(document.cookie);
    let  ca = decodedCookie.split(';');
    for (let  i = 0; i < ca.length; i++) {
      let  c = ca[i];
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
    if (matchInfo) {
      token = matchInfo[1] || null;
      if (token) this.setCookie('girderToken', token);
      return token;
    }

    return null;
  },

  setCookie: function (cname, value, path, domain, expiry) {
    let d = new Date();
    d.setTime(d.getTime() + ((expiry || 180) * 24 * 60 * 60 * 1000));
    let expires = d.toUTCString();

    document.cookie = cname + "=" + value + ";" +
      ((path) ? ";path=" + path : "") +
      ((domain) ? ";domain=" + domain : "") +
      ";expires=" + expires;
  },

  deleteCookie: function (name, path, domain) {
    if (this.getCookie(name)) {
      // Modified according to http://stackoverflow.com/questions/2144386/javascript-delete-cookie
      // Read Tasos_K's comment about the old method (commented out here) and how it no longer works.
      // It isn't explained why the old method should fail, but new method seems to work okay.
      //   document.cookie = name + "=" +
      //     ((path) ? ";path="+path:"")+
      //     ((domain)?";domain="+domain:"") +
      //     ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      this.setCookie(name, "", path, domain, -1);
    }
  },

  getWholeTaleAuthToken: function () {
    return this.getCookie('girderToken');
  },

  releaseWholeTaleCookie: function () {
    return this.deleteCookie('girderToken');
  }
});
