import Ember from 'ember';

export default Ember.Controller.extend({
  apiCall : Ember.inject.service('api-call'),
  filePreviewURL : "",
  fileDownloadURL : "",
  edit_text:null,
  isEditable: false,
  init() {
  },

  valueObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller observer hook is called from nested 'edit'");
    var model = this.get('model');
    console.log(model);

    this.set('filePreviewURL', this.get('apiCall').getPreviewLink(model.get('._id')));
    this.set('fileDownloadURL', this.get('apiCall').getDownloadLink(model.get('._id')));

    var me=this;
    var itemID = model.get('_id');
    var size = model.get('size');

    if (size < 1000000) {
      console.log("File loading " + model.get('name'));
      this.get('apiCall').getFileContents(itemID, function (response) {
        me.set("edit_text", response);
        me.set("isEditable", true);
      });
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
