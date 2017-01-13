import Ember from 'ember';
import config from '../config/environment';


export default Ember.Service.extend({
  tokenHandler: Ember.inject.service('token-handler'),
  isAuthenticated: true,


  getFileContents : function (itemID, callback) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
    var client = new XMLHttpRequest();
    client.open('GET', url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function() {
      callback(client.responseText);
    });
    client.send();
  },

  getPreviewLink :function (itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=inline';

//    https://girder.wholetale.org/api/v1/file/584ed73a548a6f00017d7504/download?contentDisposition=inline

  },

  getDownloadLink :function (itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
  },


  putItemDetails: function (itemID, name, description, success, fail) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/item/' + itemID;
    var queryPars = "";
    if (name != null) {
      queryPars += "name="+ encodeURIComponent(name);
    }
    if (description !=null) {
      if (queryPars !== "")
        queryPars += "&";
      queryPars += "description="+ encodeURIComponent(description);
    }

    if (queryPars !== "") {
      url += "?" + queryPars;
    }
    var client = new XMLHttpRequest();
    client.open('PUT', url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function() {
      success(client.responseText);
    });

    client.addEventListener("error", fail);

    client.send();
  },


  });
