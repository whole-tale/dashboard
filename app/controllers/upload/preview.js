import Ember from 'ember';
import EmberUploader from 'ember-uploader';

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export default Ember.Controller.extend({
  img_bytes:null,
  isViewable: false,
  init() {
  },

  valueObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller observer hook is called from nested 'edit'");
    var model = this.get('model');
    console.log(model);

    var me=this;
    var itemID = model.get('_id');
    var size = model.get('size');

    if ((size < 1000000) && (endsWith(model, ".png") )) {
      var url = 'https://girder.wholetale.org/api/v1/item/' + itemID + '/download?contentDisposition=attachment';
      var client = new XMLHttpRequest();
      client.open('GET', url);
      client.onreadystatechange = function() {
        me.set("img_bytes", client.responseText);
        me.set("isViewable", true);
      };
      client.send();
    }
  }),

actions: {
    download: function(itemID, itemName, ) {
    },
  textUpdated: function(newVal) {
    this.set('textContents', newVal);
  },
  updateTextFile : function () {
    // do something with

    console.log(this.get('textContents'));

  }

  }

});
