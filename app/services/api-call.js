import config from '../config/environment';
import Service from '@ember/service';
import {
  inject as service
} from '@ember/service';

export default Service.extend({
  tokenHandler: service('token-handler'),
  isAuthenticated: true,

  getFileContents(itemID, callback) {
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

  getPreviewLink(itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=inline';

    // https://girder.wholetale.org/api/v1/file/584ed73a548a6f00017d7504/download?contentDisposition=inline

  },

  getDownloadLink(itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
  },

  putItemDetails(itemID, name, description, success, fail) {
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
  * @method postTale
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

  /**
  * Creates a Tale from a dataset.
  * @method taleFromDataset
  * @param imageId The ID of the image used for the Tale
  * @param identifier The doi/identifier of the data package
  * @param spawn Bool on whether to spawn the instance
  * @param lookupKwargs Optional arguments
  * @param taleKwargs Optional arguments
  * @param success Callback function that is called on success
  * @param fail Callback function that is called on fail
  */
  taleFromDataset: function (imageId,
    identifier, 
    spawn,
    lookupKwargs,
    taleKwargs,
    success,
    fail) {
    let token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/tale/import';
    var queryPars = "?";

    queryPars += "imageId=" + encodeURIComponent(imageId);
    queryPars += "&";
    queryPars += "url=" + encodeURIComponent(identifier);

    if(spawn) {
      queryPars += "&";
      queryPars += "spawn=" + encodeURIComponent(spawn);
    }
    if (lookupKwargs) {
      queryPars += "&";
      queryPars += "lookupKwargs=" + encodeURIComponent(lookupKwargs);
    }
    if(taleKwargs) {
      queryPars += "&";
      queryPars += "taleKwargs=" + encodeURIComponent(taleKwargs);
    }

    url += queryPars;
    var client = new XMLHttpRequest();
    client.open("post", url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function () {
      if (client.status === 200) {
        success(JSON.parse(client.responseText));
      } else {
        fail(client.responseText);
      }
    });

    client.addEventListener("error", fail);
    client.send();
  },

  postInstance: function (taleId, imageId, name, success, fail) {
    // Creates an instance
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

  exportTale: function (taleId, success, fail) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/tale/' + taleId + '/export?contentDisposition=attachment';

    var client = new XMLHttpRequest();
    client.responseType = 'blob';
    client.open('GET', url);
    client.setRequestHeader("Girder-Token", token);

    // Construct a filename for the download. Ideally this would be based upon
    // the filename set by the backend but I'm not sure how to access this
    // yet
    // TODO: Set filename argument in success callback to use the filename
    // provided by the backend
    client.addEventListener("load", function () {
      if (client.status === 200) {
        success(client, "tale-export-" + taleId + '.zip');
      } else {
        fail(client);
      }
    });

    client.send();
  },

  /**
  * Queries the job result endpoint.
  * @method getFinalJobStatus
  * @param jobId The ID of the job whose status is wanted
  * @param success Function that is called on success
  * @param fail Function that is called when the call fails
  */
  getFinalJobStatus(jobId, success, fail) {
    var token = this.get('tokenHandler').getWholeTaleAuthToken();
    var url = config.apiUrl + '/job/' + jobId + '/result';

    var client = new XMLHttpRequest();
    client.open('GET', url);
    client.setRequestHeader("Girder-Token", token);
    client.addEventListener("load", function () {
      if (client.status === 200) {
        success(JSON.parse(client.responseText));
      } else {
        fail(client.responseText);
      }
    });
    client.addEventListener("error", fail);
    client.send();
  },
});
