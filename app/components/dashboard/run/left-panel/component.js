import Ember from 'ember';
import inject from 'ember-service/inject';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';

export default Ember.Component.extend(FullScreenMixin, {
  router: inject("-routing"),
  internalState: inject(),

  loadError: false,
  model: null,

  result: {
    CouldNotLoadUrl: 1,
    UrlLoadedButContentCannotBeAccessed: 2,
    UrlLoadedContentCanBeAccessed: 3
  },

  didRender() {
    // Similar to Jquery on page load
    // doesn't work because of the handlebars. But even if you unhide the element, the iframes show
    // that they load ok even though some are blocked and some are not.
    let frame = document.getElementById('frontendDisplay');
    if (frame) {
      frame.onload = function (e) {
        console.dir(e);
        let iframeWindow = frame.contentWindow;
        let that = $(this)[0];

        window.addEventListener("message", function(event) {
          if (event.origin !== window.location.origin) {
            // something from an unknown domain, let's ignore it
            return;
          }
          console.log( "received: " + event.data );
        }, false);

        iframeWindow.parent.postMessage('message sent', window.location.origin);
      };
    }
  },

  actions: {
    stop: function () {
      this.set("model", null);
    },

    openDeleteModal: function (id) {
      var selector = '.ui.' + id + '.modal';
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      model.deleteRecord();
      model.save();
      this.get('router').transitionTo('run');

      return false;
    },

    denyDelete: function () {
      return true;
    }

  }
});
