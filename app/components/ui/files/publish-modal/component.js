import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';

import config from '../../../../config/environment';

export default Ember.Component.extend({
    layout,
    authRequest: Ember.inject.service(),
    // Holds an object that represents files that can be excluded from publishing
    mutableFiles: Ember.A(),
    // Holds an array of objects that cannot be excluded from publishing
    immutableFiles: Ember.A(),
    publishingLocations: Ember.A(),
    enablePublish: true,
    selectedRepository: 'Development',
    taleId: '5afc8629bb335720d60252bb',
    // Flag set to show the spinner
    publishing: false,
    publishingFinish: false,
    // An array that holds a pair, (fileName, fileSize)
    fileList: [],
    repositoryMapping: {'Development': 'https://dev.nceas.ucsb.edu/knb/d1/mn/'},
    packageUrl: '',
    
    setPublishBtnState(state) {
        console.debug(state)
        this.set('enablePublish', state);
    },

    getTaleFiles() {
        let url = config.apiUrl + '/tale/'+ this.get('taleId') 
        let self = this;
        this.get('authRequest').send(url)
        .then(rep => {
            let folderId = rep['folderId'];
            let queryParams = "?"+[
                "folderId="+folderId,
                "limit=0",
                "sort=lowerName",
                "sortdir=1"
            ].join('&');

            url = config.apiUrl + '/item' + queryParams;
            let options = {
                method: 'GET',
                data: {
                    folderId: folderId,
                    limit: 0,
                    sort: 'lowerName',
                    sortdir: 1
                }}
            self.get('authRequest').send(url) 
            .then(rep => {
                let fileList2 = []
                rep.forEach(function(item)
                {
                    let path = item.name //self.getPath(item.name)
                    fileList2.push({'name': path, 'size':item.size, 'id': item._id})
                })
                self.set('fileList', fileList2)
            })
        })
        console.log(self.get('fileList'))
    },

    getPath(id) {
            let url = config.apiUrl + '/item/'+ id + '/rootpath'
            let self = this;
            let path = '';
            let hasRoot = false;

            this.get('authRequest').send(url)
                .then(rep => {
                    console.log(rep);
                    rep.forEach(function(folder) {
                        let folderName = folder.object['name'];
                        if (folderName == 'Data' | folderName == "Home") {
                            path += folderName;
                            hasRoot = true;
                        }
                        if (hasRoot) {
                            path += folderName;
                        }
                    })
                    console.log(path)
                });
    },

    getFileParent(file) {
        let self = this;
    
        let promisedParentMeta;
    
        if(file.get('_modelType') === "folder") {
          promisedParentMeta = new RSVP.Promise(resolve => {
            resolve({
              id:   file.get('parentId'),
              type: file.get('parentCollection')
            });
          });
        }
        else {
          let url = config.apiUrl + "/item/" + file.get('id') + "/rootpath";
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
/*         $('.info.circle.blue.icon').popup({
          position : 'right center',
          target   : '.info.circle.blue.icon',
          hoverable: true,
          html: "Place this tale in the public domain and opt out of copyright protection. \
          For more information, visit the <a href='https://spdx.org/licenses/CC0-1.0.html' target='_blank'>CC0 reference page</a>."
        }); */


        $('.info.circle.grey.icon').popup({
          position : 'right center',
          target   : '.info.circle.grey.icon',
          hoverable: true,
          html: "The URL or DOI of \
          the data object. Data packages can be imported into Whole Tale from <a href='https://dataone.org/' target='_blank'>DataONE</a> and select \
          <a href='https://www.globus.org/' target='_blank'>Globus</a> repositories. For a full list of DataONE member nodes and supported Globus \
         repositories, visit the <a href='http://wholetale.readthedocs.io/users_guide/manage.html' target='_blank'>data registration guide</a>."
        });

/*         $('.info.circle.blue.icon.ccby').popup({
            position : 'right center',
            target   : '.info.circle.blue.icon.ccby',
            hoverable: true,
            html: "The URL or DOI of \
           repositories, visit the <a href='https://spdx.org/licenses/CC-BY-4.0.html' target='_blank'>CC-BY reference page</a>."
          }); */
    },

    joinArray(arr) {
        let joined = String()
        arr.forEach(function(item) {
            joined += "'" +item+"'"
        })
        return joined
    },

    prepareItemIds() {
        let itemIdList = []
        this.get('fileList').forEach(function(item) {
            itemIdList.push(JSON.stringify(item.id));
        })
        
        console.log(itemIdList)
        return itemIdList;
    },

    actions: {
        publishTale: function() {

            if (this.get('publishingFinish') == true) {
                var win = window.open(this.get('packageUrl'), '_blank');
                win.focus();
            }

            this.set('enablePublish', false)
            this.set('publishing', true)
            let self = this;
            console.log('Publishing Tale');
            let queryParams = "?"+[
                "itemIds=" + "["+(self.prepareItemIds().join(','))+"]",
                "taleId=" + self.get('taleId'),
                "repository=" + self.get('repositoryMapping')[self.get('selectedRepository')]
            ].join('&');
            
            let url = config.apiUrl + '/repository/createPackage' + queryParams;

            console.log(queryParams);

            this.get('authRequest').send(url)
                .then(rep => {
                    self.set('enablePublish', false);
                    this.set('publishingFinish', true)
                    self.set('packageUrl', rep)
                    self.set('publishing', false)
                })
                return false
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
