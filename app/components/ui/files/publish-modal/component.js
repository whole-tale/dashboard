import Ember from 'ember';
import RSVP from 'rsvp';

import config from '../../../../config/environment';
import EventStream from 'npm:sse.js';

export default Ember.Component.extend({
    authRequest: Ember.inject.service(),
    internalState: Ember.inject.service(),
    userAuth: Ember.inject.service(),
    tokenHandler: Ember.inject.service("token-handler"),
    notificationHandler: Ember.inject.service(),
    // Controls the state of the publish button
    enablePublish: true,
    // The repository that the user has selected
    selectedRepository: '',
    // Flag that sets/unsets the spinner on the publish button
    publishing: false,
    // Set when publishing has finished
    publishingFinish: false,
    // An array that holds a pair, (fileName, fileSize)
    fileList: [],
    // Holds an array of objects that the user cannot be exclude from their package
    nonOptionalFile: ['tale.yaml',
    'environment.tar.gz',
     'license.txt',
     'science_metadata.xml'],
    // A map that connects the repository dropdown to a url
    repositories: [{
        name: 'NCEAS Development',
        url: 'https://dev.nceas.ucsb.edu/knb/d1/mn/',
        licenses: ['cc0', 'ccby4']}],
    // The url for the published tale. This is set after publication succeeds
    packageUrl: '',
    // The jwt token that allows the user to interact with DataONE
    dataoneJWT: '',
    // The licenses that the user can potentially select
    licenses: {
        'cc0': {
            'name': 'Creative Commons Public Domain CCO',
            'spdx': 'CC0-1.0',
            'short': 'CC0'},
        'ccby3': {
            'name': 'Creative Commons Attribution CC-BY 3.0',
            'spdx': 'CC-BY-3.0',
            'short': 'CC-BY3'},
        'ccby4': {
            'name': 'Creative Commons Attribution CC-BY 4.0',
            'spdx': 'CC-BY-4.0',
            'short': 'CC-BY4'},
        },
    // Filtered list of licenses that are available for selection. This changes when the user
    // changes the selected repository.
    availableLicenses: [],
    // The name of the tale
    taleName: '',


    didInsertElement() {

            this.set('selectedRepository', this.get('repositories')[0].name);
            this.setLicenses();
            this.setTaleName();
            
    },

    didRender () {
        // Create the tooltips after the template has been rendered
        this.create_tooltips();
       
       // Set the default repository
       this.getTaleFiles()
    },

    setTaleName() {
        let url = config.apiUrl + '/tale/'+ this.get('modalContext') 
        let self = this;
        this.get('authRequest').send(url)
        .catch (e=> {
            self.set('taleName', '');
        })
        .then(rep => {
            self.set('taleName', rep['title'])
        });
    },

    setPublishBtnState(state) {
        this.set('enablePublish', state);
    },

    getTaleFiles() {
        let url = config.apiUrl + '/tale/'+ this.get('modalContext') 
        let self = this;
        self.get('authRequest').send(url)
        .then(rep => {
            let folderId = rep['folderId'];
            let queryParams = '?'+[
                'folderId='+folderId,
                'limit=0',
                'sort=lowerName',
                'sortdir=1'
            ].join('&');

            url = config.apiUrl + '/item' + queryParams;
            let options = {
                method: 'GET',
                data: {
                    folderId: folderId,
                    limit: 0,
                    sort: 'lowerName',
                    sortdir: 1
                }};
            self.get('authRequest').send(url) 
            .then(rep => {
                debugger;
                let fileList2 = []
                rep.forEach(function(item)
                {
                    let path = item.name;
                    fileList2.push({'name': path, 'size':item.size, 'id': item._id});
                })
                self.set('fileList', fileList2);
            })
    })
},

    create_tooltips() {
        // Creates the popup balloons for the info tooltips

        // Create the popup in the main title
        $('.info.circle.blue.icon.main').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.main',
            hoverable: true,
            html: "Get a citeable DOI by publishing your Tale on <a href='https://www.dataone.org/' target='_blank'>DataONE.</a> \
            For more information on how to publish and cite your tale, visit the \
            <a href='http://wholetale.readthedocs.io/users_guide/publishing.html' target='_blank'>publishing guide</a>."
          });

        // Create the CC0 popup
        $('.info.circle.blue.icon.CC0').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.CC0',
            hoverable: true,
            html: "Place this tale in the public domain and opt out of copyright protection. \
            For more information, visit the <a href='https://spdx.org/licenses/CC0-1.0.html' target='_blank'>CC0 reference page</a>."
          });

        // Create the CCBY3 popup
        $('.info.circle.blue.icon.CC-BY3').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.CC-BY3',
            hoverable: true,
            html: "Require that users properly attribute the authors of this tale with the CCBY 3.0 standards. \
            For more information, visit the <a href='https://spdx.org/licenses/CC-BY-3.0.html' target='_blank'>CCBY3 reference page</a>."
          });

        // Create the CCBY4 popup
        $('.info.circle.blue.icon.CC-BY4').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.CC-BY4',
            hoverable: true,
            html: "Require that users properly attribute the authors of this tale with the CCBY 4.0 standards. \
            For more information, visit the <a href='https://spdx.org/licenses/CC-BY-4.0.html' target='_blank'>CCBY4 reference page</a>."
          });

        // Create the popups for the environment files. Files with an extension
        // need to have the period escaped with a double backslash when referencing.
        // Create the tale.yaml popup
        $('.info.circle.blue.icon.tale\\.yaml').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.tale\\.yaml',
            hoverable: true,
            html: "This file holds metadata about the tale, such as script execution order and file structure."
        });
        // Create the environment.tar popup
        $('.info.circle.blue.icon.environment\\.tar\\.gz').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.environment\\.tar\\.gz',
            hoverable: true,
            html: "The environment archive holds the information needed to re-create the tale's base virtual machine."
        });
         // Create the LICENSE popup
        $('.info.circle.blue.icon.license\\.txt').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.license\\.txt',
            hoverable: true,
            html: "Each package is created with a license, which can be selected below."
        });
         // Create the science_metadata popup
        $('.info.circle.blue.icon.science_metadata\\.xml').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.science_metadata\\.xml',
            hoverable: true,
            html: "The contents of each package are described using the Ecological Metadata Language (EML). \
             To learn more about EML, visit the \
             <a href='https://esajournals.onlinelibrary.wiley.com/doi/abs/10.1890/0012-9623%282005%2986%5B158%3AMTVOED%5D2.0.CO%3B2' \
              target='_blank'>EML primer</a>."
        });
    },

    joinArray(arr) {
        let joined = String();
        arr.forEach(function(item) {
            joined += "'" +item+"'";
        });
        return joined;
    },

    prepareItemIds() {
        let itemIdList = [];
        this.get('fileList').forEach(function(item) {
            itemIdList.push(JSON.stringify(item.id));
        });
        
        console.log(itemIdList);
        return itemIdList;
    },

    getDataONEJWT() {
        /* 
        Queries the DataONE `token` endpoint for the jwt. When a user signs into
        DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
        found, then the response will be empty. Otherwise the jwt is returned.
        */

        // Use the XMLHttpRequest to handle the request
        let xmlHttp = new XMLHttpRequest();
        // Open the request to the the token endpoint, which will return the jwt if logged in
        if(config.dev) {
            xmlHttp.open("GET", 'https://cn-stage-2.test.dataone.org/portal/token', false );
        }
        else {
        xmlHttp.open("GET", 'https://cn.dataone.org/portal/token', false );
        }
        // Set the response content type
        xmlHttp.setRequestHeader("Content-Type", "text/xml");
        // Let XMLHttpRequest know to use cookies
        xmlHttp.withCredentials = true;
        xmlHttp.send(null);
        
        return xmlHttp.responseText;
    },
      
    dataoneLogin() {
        /*
        Responsible for opening the login dialog for the user. Ideally, we could
        tell when the user finishes logging in so that we know when to fetch the token
        */

       window.open(config.orcidLogin,'auth','height=600,width=550').focus();
    },

    loggedIntoDataONE() {
        // Returns true/false if the user is logged into DataONE.
        // Note that this resets the jwt
        if (this.get('dataoneJWT')) {
            return true;
        }
        return false;
    },

    attemptLogin() {
        let jwt = this.getDataONEJWT();
        if (!jwt) {
            return false;
        }
        this.setDataONEJWT(jwt);
        return true;
    },

    setDataONEJWT(dataoneJWT) {
        this.set('dataoneJWT', dataoneJWT);
    },

    getRepositoryPathFromName(name) {
        // Given a repository name, find the membernode URL
        let repostoryList = this.get('repositories')
        for (var i=0; i < repostoryList.length; i++) {
            if (repostoryList[i].name === name) {
                return repostoryList[i].url;
            }
        }
    },

    publish: function(){
        let self = this;
        
        // Set the url parameters for the endpoint
        let queryParams = '?'+[
            'itemIds=' + '['+self.prepareItemIds()+']',
            'taleId=' + self.get('modalContext'),
            'repository=' + self.getRepositoryPathFromName(self.get('selectedRepository')),
            'jwt=' + self.get('dataoneJWT'),
            'licenseId='+self.getSelectedLicense()
        ].join('&');
        
        let url = config.apiUrl + '/repository/createPackage' + queryParams;
        let source = self.getEventStream();
        this.get('authRequest').send(url)
        .catch (e=> {
            let notifier = self.get('notificationHandler');
             notifier.pushNotification({
            header: "Error Retrieving Publishing Status",
            message: e.message
            });
        })
            .then(rep => {
                // Update the UI state
                if (self.isURL(rep)) {
                    self.set('enablePublish', false);
                    self.set('publishingFinish', true);
                    self.set('packageUrl', rep);
                    self.set('publishing', false);
                }
                else {
                    alert('There was an error registering your Tale ' + String(rep))
                self.set('enablePublish', true);
                self.set('publishingFinish', false);
                self.set('publishing', false);
                }
            })
            .finally(_ => {
                console.log('Closing source')
                source.close();
            });
        },

    openPackage: function() {
        let win = window.open(this.get('packageUrl'), '_blank');
        win.focus();
        return;
},

getSelectedLicense() {
    // Returns the id of the selected license
    let selected_radio = $('input[name=license-radio]:checked').parent();
    if (selected_radio.length) {
        return selected_radio[0].id;
    }
    //If we can't find a checked radio, default to cc0
    return this.get('licenses').cc0.spdx;
  },

  setLicenses() {
    // Sets the licenses that the user can choose from, based on the selected repository
    let self=this;
      if (self.get('selectedRepository') === 'NCEAS Development') {
            let availableLicenses = []

            self.get('repositories')[0].licenses.forEach(function(entry) {
                let licenses = self.get('licenses')
                availableLicenses.push(licenses[entry])
        });
        console.log(availableLicenses)
        self.set('availableLicenses', availableLicenses);
      }
      else {
          // If for some reason the dropdown isn't set, default to CC0
          self.set('availableLicenses', [self.get('licenses').cc0]);
      }
  },

  getEventStream() {
    let self = this;
    let token = self.get('tokenHandler').getWholeTaleAuthToken();
     // Get a timestamp so that we can filter out any stale notifications. This needs to be Unix Epoch
    let time = Math.round(+new Date()/1000)
    let source = new EventStream.SSE(config.apiUrl+"/notification/stream?timeout=15000&since="+time,
     {headers: {'Girder-Token': token}});
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

isURL(str)
{
    let regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)\(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if (regexp.test(str))
        {
          return true;
        }
        else
        {
          return false;
        }
},

    actions: {

        closeModal() {
            return this.closeModal();
        },

        publishedClicked(){
            /* 
            Called when the `Publish` button is clicked. It controls the flow
            of logging in and communicating with the `createPackage` endpoint.
            */
           let self = this;
           if (self.get('publishingFinish')) {
            self.openPackage();
            return;
           }
           
           // Disable the button so that it isn't accidentally clicked multiple times
           self.set('enablePublish', false);

           // Let the UI know that the user clicked the `Publish` button. 
           self.set('publishing', true);

           let loggedIn = self.attemptLogin()

           if (loggedIn) {
               // If they are, go ahead and publish
               self.publish();
           }
           else {
               // If they aren't logged in, prompt them to do so
               self.dataoneLogin();

               loggedIn = self.attemptLogin()
               if (!loggedIn) {
                   return false
               }
               self.publish();
               self.set('enablePublish', false);
               self.set('publishing', false);
           }

            // Return false so the dlg stays open
           return false;
        },


        onRepositoryChange: function() {
            // Called when the user changes the repository
               this.setLicenses()
        }
    },
});
