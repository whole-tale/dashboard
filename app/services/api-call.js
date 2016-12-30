import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({
  isAuthenticated: true,

  getFileContents : function (itemID, callback) {
    var url = config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
    var client = new XMLHttpRequest();
    client.open('GET', url);
    client.onreadystatechange = function() {
      callback(client.responseText);
    };
    client.send();
  },

  getPreviewLink :function (itemID) {
    return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=inline';

//    https://girder.wholetale.org/api/v1/file/584ed73a548a6f00017d7504/download?contentDisposition=inline

  }
});
