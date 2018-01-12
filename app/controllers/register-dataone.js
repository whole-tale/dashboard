import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import EventStream from 'npm:sse.js';

import config from '../config/environment';

export default Ember.Controller.extend({
    internalState: Ember.inject.service(),
    authRequest: Ember.inject.service(),
    userAuth: Ember.inject.service(),
    tokenHandler: Ember.inject.service(),
    notificationHandler: Ember.inject.service(),
    // The identifier for the data package. Set by the router
    doi: null,
    // The name of the data package. Set during the package search
    name: null,
    // Holds the data packages that matches the doi.
    datasources: Ember.A(),

    init() {
    this._super(...arguments);
  },

  getEventStream() {
    let token = this.get('tokenHandler').getWholeTaleAuthToken();
    let source = new EventStream.SSE(config.apiUrl+"/notification/stream?timeout=15000", {headers: {'Girder-Token': token}});

    let self = this;
    source.addEventListener('message', function(evt) {
        let payload = JSON.parse(evt.data);
        let notifier = self.get('notificationHandler');
        
        notifier.pushNotification({
            message: payload.data.message,
            header: payload.data.title
        });
    });

    source.stream();

    return source;
},

  register: function() {
    console.log("Register Called");

    // There may be more than one data packages found, but we only want the one form DataOne.
    let ds = this.datasources.find(ds => {
      return ("DataONE" == ds.repository);
    });

    let state = this.get('internalState');
    let userAuth = this.get('userAuth');

    let parentId = state.getCurrentParentId();
    let parentType = state.getCurrentParentType();

    if(!!parentId || parentId === "undefined" || parentId === undefined) {
        parentId = userAuth.getCurrentUserID();
        parentType = "user";
    }

    let queryParams = "?"+[
        "parentType="+parentType,
        "parentId="+parentId,
        "public=false"
    ].join('&');

    let dataMap = JSON.stringify([{
        name: ds.name,
        dataId: ds.dataId,
        repository: 'DataONE'
    }]);

    // Set the register enpoint
    let url = config.apiUrl + '/dataset/register' + queryParams;

    // Fill out an object with the query parameters
    let options = {
        method: 'POST',
        data: {
            dataMap: dataMap
        }
    };

    let source = this.getEventStream();
    let self = this;

    this.get('authRequest').send(url, options)
        .then(rep => {
        })
        .catch(e => {
            let notifier = self.get('notificationHandler');
            notifier.pushNotification({
                header: "Error Registering Dataset",
                message: e
            });
        })
        .finally(_ => {
            source.close();
        });
},

  actions: {
    
    // Copies a data package from DataOne into the Whole Tale environment. It first
    // uses the doi or uri of the datapackage to locate it. The doi/uri is set by the route.
    // Once located, the registration process is started.
    copyData: function() {

        // Set the path to the lookup endpoint
          let url = config.apiUrl + '/repository/lookup';

          // Place the request parameters in an object for utility
          let options = {
              method: 'GET',
              data: {
                  dataId: JSON.stringify(decodeURI(this.doi.doi).split())
              }
          };
    
          // DEVNOTE: Why do we let self = this
          let self = this;
          let req = self.get('authRequest');

          // Send the query off with the parameters object
          req.send(url, options)
              .then(rep => {

                // Store the 
                self.datasources.pushObjects(rep);
                console.log("Finished pushing datasources");
                // datasources is accessed in register, so wait until the object if filled
                // out before proceeding.
                this.register();
              })
              .catch(e => {
                  console.log("Error: " + e);
                // TODO: Notify the user w/ further instructions
              })
              return;
      },
  }
});
