import Ember from 'ember';
import RSVP from 'rsvp';

import config from '../../../../config/environment';

export default Ember.Component.extend({
    authRequest: Ember.inject.service(),
    internalState: Ember.inject.service(),
    // Controls the state of the publish button
    enablePublish: true,
    // Set the default repository to dev
    selectedRepository: 'Development',
    // Flag set to show the spinner
    publishing: false,
    // Set when publishing has finished
    publishingFinish: false,
    // An array that holds a pair, (fileName, fileSize)
    fileList: [],
    // Holds an array of objects that the user cannot be exclude from their package
    nonOptionalFile: ['tale.yaml', 'environment.zip'],
    // A map that connects the repository dropdown to a url
    repositoryMapping: {'Development': 'https://dev.nceas.ucsb.edu/knb/d1/mn/'},
    // The url for the published tale. This is set after publication succeeds
    packageUrl: '',
    // The jwt token that allows the user to interact with DataONE
    dataoneJWT: '',

    setPublishBtnState(state) {
        this.set('enablePublish', state);
    },

    getTaleFiles() {
        let url = config.apiUrl + '/tale/'+ this.get('modalContext') 
        let self = this;
        this.get('authRequest').send(url)
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

    getPath(id) {
            let url = config.apiUrl + '/item/'+ id + '/rootpath';
            let self = this;
            let path = '';
            let hasRoot = false;

            this.get('authRequest').send(url)
                .then(rep => {
                    rep.forEach(function(folder) {
                        let folderName = folder.object['name'];
                        if (folderName === 'Data' || folderName === 'Home') {
                            path += folderName;
                            hasRoot = true;
                        }
                        if (hasRoot) {
                            path += folderName;
                        }
                    })
                });
    },

    getFileParent(file) {
        let self = this;
        let promisedParentMeta;
    
        if(file.get('_modelType') === 'folder') {
          promisedParentMeta = new RSVP.Promise(resolve => {
            resolve({
              id:   file.get('parentId'),
              type: file.get('parentCollection')
            });
          });
        }
        else {
          let url = config.apiUrl + '/item/' + file.get('id') + '/rootpath';
          promisedParentMeta = this.get('authRequest').send(url)
            .then(response => {
              let parent = response.pop();
              return {
                id:   parent.object._id,
                type: parent.type
              };
            })
          ;
        }
    
        return promisedParentMeta;
      },

    didInsertElement() {
        this._super(...arguments);

        this.getTaleFiles();
    },

    didRender () {
        // Create the tooltips after the template has been rendered
        this.create_tooltips();
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
            <a href='http://wholetale.readthedocs.io/users_guide/publish.html' target='_blank'>publishing guide</a>."
          });

        // Create the CC0 popup
        $('.info.circle.blue.icon.cc0').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.cc0',
            hoverable: true,
            html: "Place this tale in the public domain and opt out of copyright protection. \
            For more information, visit the <a href='https://spdx.org/licenses/CC0-1.0.html' target='_blank'>CC0 reference page</a>."
          });

        // Create the CCBY3 popup
        $('.info.circle.blue.icon.ccby3').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.ccby3',
            hoverable: true,
            html: "Require that users properly attribute the authors of this tale with the CCBY 3.0 standards. \
            For more information, visit the <a href='https://spdx.org/licenses/CC-BY-3.0.html' target='_blank'>CCBY3 reference page</a>."
          });

        // Create the CCBY4 popup
        $('.info.circle.blue.icon.ccby4').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.ccby4',
            hoverable: true,
            html: "Require that users properly attribute the authors of this tale with the CCBY 4.0 standards. \
            For more information, visit the <a href='https://spdx.org/licenses/CC-BY-4.0.html' target='_blank'>CCBY4 reference page</a>."
          });
    },

    joinArray(arr) {
        let joined = String();
        arr.forEach(function(item) {
            joined += "'" +item+"'";
        })
        return joined;
    },

    prepareItemIds() {
        let itemIdList = []
        this.get('fileList').forEach(function(item) {
            itemIdList.push(JSON.stringify(item.id));
        })
        
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
       let url = 'https://cn-stage-2.test.dataone.org/portal/oauth?action=start&target='+config.authRedirect;
       let newwindow = window.open(url,'auth','height=400,width=450');
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

    publish: function(){
        let self = this;

        // Set the url parameters for the endpoint
        let queryParams = '?'+[
            'itemIds=' + '["+(self.prepareItemIds().join(','))+"]',
            'taleId=' + self.get('modalContext'),
            'repository=' + self.get('repositoryMapping')[self.get('selectedRepository')],
            'jwt=' + self.get('dataoneJWT'),
            'licenseId='+self.getSelectedLicense()
        ].join('&');
        
        let url = config.apiUrl + '/repository/createPackage' + queryParams;

        this.get('authRequest').send(url)
            .then(rep => {
                // Update the UI state
                self.set('enablePublish', false);
                this.set('publishingFinish', true);
                self.set('packageUrl', rep);
                self.set('publishing', false);
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
    //If we can't find a checked radio, default to 0
    return '0';
  },

    actions: {
        publishedClicked(){
            /* 
            Called when the `Publish` button is clicked. It controls the flow
            of logging in and communicating with the `createPackage` endpoint.
            */
           let self = this;
           if (self.get('publishingFinish')) {
            self.openPackage();
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
               self.setDataONEJWT();
               self.publish();
               self.set('enablePublish', false);
               self.set('publishing', false);
           }

            // Return false so the dlg stays open
           return false;
        },

        cancelPublish: function() {
            console.log('Canceling');
        },

        onNodeChange: function() {
            if(this.get('selectedRepository') != '')
            {
               // setPublishBtnState(true)
            }
            else
            {
                //setPublishBtnState(false)
            }
            
        }
    },
});
