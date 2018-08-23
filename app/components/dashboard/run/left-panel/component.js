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

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', this, () => {
        // Check if we're coming from an ORCID redirect
        // If ?auth=true
        // Open Modal
    });
  },

  getDataONEJWT() {
          /*
          Queries the DataONE `token` endpoint for the jwt. When a user signs into
          DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
          found, then the response will be empty. Otherwise the jwt is returned.
          */
    
          // Use the XMLHttpRequest to handle the request
          console.log('getting d1 JWT');
          let xmlHttp = new XMLHttpRequest();
          // Open the request to the the token endpoint, which will return the jwt if logged in
          xmlHttp.open("GET", 'https://cn-stage-2.test.dataone.org/portal/token', false );
          // Set the response content type
          xmlHttp.setRequestHeader("Content-Type", "text/xml");
          // Let XMLHttpRequest know to use cookies
          xmlHttp.withCredentials = true;
          xmlHttp.send(null);
          console.log(xmlHttp);
          return xmlHttp.responseText;
      },

      hasD1JWT: Ember.computed('model._id', function () {
        let jwt = this.getDataONEJWT();
        if (!jwt) {
            return false;
        }
        return true;
      }),

      showModal: function(modalDialogName, modalContext) {
        // Open Modal
    },

  actions: {
    stop: function () {
      this.set("model", null);
    },

    publishTale: function(taleId) {
        if (this.hasD1JWT) {
            // Open Modal
        }
        else {
            var selector = '.ui.dataone.modal';
            $(selector).modal('show');
        }
      },

    denyDataONE: function() {
        return true;
    },

    authenticateD1(taleId) {
        let callback = 'http://probable-cattle.nceas.ucsb.edu:4200/run/'+taleId+'?auth=true';
            let orcidLogin = 'https://cn-stage-2.test.dataone.org/portal/oauth?action=start&target=';
            window.location.replace(orcidLogin + callback);
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
