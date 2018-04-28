import Ember from 'ember';
import service from "ember-service/inject";

export default Ember.Component.extend({
  router: service("-routing"),

  loadError:  false,
  model: null,

  result : {
    CouldNotLoadUrl:1,
    UrlLoadedButContentCannotBeAccessed:2,
    UrlLoadedContentCanBeAccessed:3
  },

  modelChanged: Ember.observer('model', function() {
      console.log("Updated !");

      // gets the url that is being used by the iFrame
      var url = this.get('model').url;

    }),

  didRender() {
    // Like Jquery on page load

    // doesn't work because of the handlebars. But even if you unhide the element, the iframes show
    // that they load ok even though some are blocked and some are not.
//    var frame = document.getElementById('frontendDisplay');

//    frame.onload = function(e){
  //    console.dir(e)
    //};

  },


  actions: {
    stop: function () {
      this.set("model", null);
    },

    openDeleteModal: function(id) {
      var selector = '.ui.' + id + '.modal';
      console.log("Selector: " +  selector);
      $(selector).modal('show');
    },

    approveDelete: function(model) {
      console.log("Deleting model " + model.name);
      model.deleteRecord();
      model.save();

      this.get('router').transitionTo('run');

      return false;
    },

    denyDelete: function() {
      return true;
    }



  }

});
