import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({
  tokenHandler: Ember.inject.service('token-handler'),
  isAuthenticated: true,


  getFileContents: function (itemID, callback) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
    var client = new XMLHttpRequest();
    client.open('GET', url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function () {
      callback(client.responseText);
    });
    client.send();
  },

  getPreviewLink: function (itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=inline';

    // https://girder.wholetale.org/api/v1/file/584ed73a548a6f00017d7504/download?contentDisposition=inline

  },

  getDownloadLink: function (itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
  },


  putItemDetails: function (itemID, name, description, success, fail) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/item/' + itemID;
    var queryPars = "";
    if (name != null) {
      queryPars += "name=" + encodeURIComponent(name);
    }
    if (description != null) {
      if (queryPars !== "")
        queryPars += "&";
      queryPars += "description=" + encodeURIComponent(description);
    }

    if (queryPars !== "") {
      url += "?" + queryPars;
    }
    var client = new XMLHttpRequest();
    client.open('PUT', url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function () {
      if (client.status === 200) {
        success(client.responseText);
      } else {
        fail(client);
      }
    });

    client.addEventListener("error", fail);

    client.send();
  },


  /**
   * Posts a Tale, using the query parameters specified in the API ...
   * @param httpCommand
   * @param taleID
   * @param imageId
   * @param folderId
   * @param instanceId
   * @param title
   * @param description
   * @param isPublic
   * @param configuration
   * @param success
   * @param fail
   */
  postTale: function (httpCommand, taleID, imageId, folderId, instanceId, title, description, isPublic, configuration, success, fail) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/tale/';
    var queryPars = "";
    if (httpCommand === "post") {
      if (imageId == null) {
        fail("You must provide an image");
        return;
      }
      if (folderId == null) {
        fail("You must provide a folder");
        return;
      }
      queryPars += "imageId=" + encodeURIComponent(imageId);
      queryPars += "&";
      queryPars += "folderId=" + encodeURIComponent(folderId);
    } else {
      url += taleID + "/";
    }

    if (instanceId != null) {
      if (queryPars !== "")
        queryPars += "&";
      queryPars += "instanceId=" + encodeURIComponent(instanceId);
    }
    if (title != null) {
      if (queryPars !== "")
        queryPars += "&";
      queryPars += "title=" + encodeURIComponent(title);
    }
    if (description != null) {
      queryPars += "&";
      queryPars += "description=" + encodeURIComponent(description);
    }

    if (isPublic != null) {
      queryPars += "&";
      queryPars += "public=" + encodeURIComponent(isPublic);
    }

    if (configuration != null) {
      queryPars += "&";
      queryPars += "config=" + encodeURIComponent(configuration);
    }

    if (queryPars !== "") {
      url += "?" + queryPars;
    }
    var client = new XMLHttpRequest();
    client.open(httpCommand, url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function () {
      if (client.status === 200) {
        success(client.responseText);
      } else {
        fail(client.responseText);
      }
    });

    client.addEventListener("error", fail);

    client.send();
  },

  postInstance: function (taleId, imageId, name, success, fail) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/instance/';
    var queryPars = "";
    if ((taleId == null) && (imageId == null)) {
      fail("You must provide a tale or an image ID");
      return;
    }

    if (taleId == null) {
      queryPars += "imageId=" + encodeURIComponent(imageId);
    } else {
      queryPars += "imageId=" + encodeURIComponent(imageId);
      queryPars += "&";
      queryPars += "taleId=" + encodeURIComponent(taleId);
    }
    if (name != null) {
      queryPars += "&";
      queryPars += "name=" + encodeURIComponent(name);
    }


    if (queryPars !== "") {
      url += "?" + queryPars;
    }
    var client = new XMLHttpRequest();
    client.open("post", url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function () {
      if (client.status === 200) {
        success(client.responseText);
      } else {
        fail(client.responseText);
      }
    });

    client.addEventListener("error", fail);

    client.send();
  },

});
