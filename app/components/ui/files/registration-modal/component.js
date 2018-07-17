import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';
import EventStream from 'npm:sse.js';

import config from '../../../../config/environment';

export default Ember.Component.extend({
    layout,
    authRequest: Ember.inject.service(),
    userAuth: Ember.inject.service(),
    internalState: Ember.inject.service(),
    tokenHandler: Ember.inject.service(),
    notificationHandler: Ember.inject.service(),

    datasources: Ember.A(),
    num_results: -1,
    error: false,
    errorMessage: '',
    searching: false,
    searchDataId: '',
    dataId: '',
    doi: '',
    name: '',
    repository: '',
    // Size of the package found
    size: '',
    // When set to true, the backend will search the DataONE dev server
    useDev: '',
    // Controls whether the results section is shown in the UI
    showResults: false,
    // URL to the Development member node
    devUrl: 'https://dev.nceas.ucsb.edu/knb/d1/mn/v2',
    // URL to the DataONE production server
    prodUrl: 'https://cn.dataone.org/cn/v2',

    didInsertElement() {
        this._super(...arguments);

        $(".info.circle.grey.icon").hover(function() {
            $("#info-data-content").removeClass("hidden");
        },
        function() {
            $("#info-data-content").addClass("hidden");
        }
    );
    },

    disableRegister() {
        Ember.$('.icon.register').removeClass('checkmark');
        Ember.$('.ui.positive.register.button').addClass('disabled');
    },

    enableRegister(dataId) {
        let ds = this.datasources.find(ds => {
            return (dataId == ds.dataId || dataId == ds.doi);
        });

        this.set('dataId', ds.dataId);
        this.set('doi', ds.doi);
        this.set('name', ds.name);
        this.set('repository', ds.repository);
        this.set('size', ds.size);

        Ember.$('.icon.register').addClass('checkmark');
        Ember.$('.ui.positive.register.button').removeClass('disabled');
    },

    clearModal() {
        this.clearErrors();
        this.clearSearch();
        this.clearResults();
        this.clearPackageResults();
    },

    clearErrors() {
        this.set('error', false);
        this.set('errorMessage', '');
    },
    
    clearResults() {
        Ember.$('#harvester-dropdown').dropdown('clear');
        this.set('showResults', false);
        this.set('num_results', -1);
        this.set('datasources', Ember.A());
    },

    clearPackageResults() {
        this.set('dataId', '');
        this.set('doi', '');
        this.set('name', '');
        this.set('repository', '');
        this.set('size', '');
    },

    clearSearch() {
        Ember.$('#searchbox').val('');
    },

    didRender() {
        let self = this;
        Ember.$('#harvester-dropdown').dropdown({
            onChange: function(dataId) {
                if(!dataId || dataId === "") {
                    self.disableRegister();
                    return;
                }
                self.enableRegister(dataId);
            }
        });
    },

    getEventStream() {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        // Get a timestamp so that we can filter out any stale notifications. This needs to be Unix Epoch
        let time = Math.round(+new Date()/1000)
        let source = new EventStream.SSE(config.apiUrl+"/notification/stream?timeout=15000&since="+time, {headers: {'Girder-Token': token}});

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

    actions: {

        updateDev(value) {
            // Called if the `use dev` checkbox is clicked
            this.set('useDev', value);
        },

        register() {
            this.clearErrors();
            let self = this;
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
                name: this.name,
                dataId: this.dataId,
                repository: this.repository
            }]);

            let baseUrl=this.get('podUrl');
            if (this.get('useDev')) {
                baseUrl=this.get('devUrl')
            }

            let url = config.apiUrl + '/dataset/register' + queryParams;
            let options = {
                method: 'POST',
                data: {
                    dataMap: dataMap,
                    base_url: baseUrl
                }
            };

            let source = this.getEventStream();

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

            this.clearModal();
            this.disableRegister();
        },

        cancel() {
            this.clearModal();
            this.disableRegister();
        },

        search() {
            this.clearResults();
            this.clearErrors();
            this.clearPackageResults()
            this.set('searching', true);
            this.set('showResults', true);

            let url = config.apiUrl + '/repository/lookup';

            let baseUrl=this.get('podUrl');
            if (this.get('useDev')) {
                baseUrl=this.get('devUrl')
            }

            let options = {
                method: 'GET',
                data: {
                    dataId: JSON.stringify(this.searchDataId.split()),
                    base_url: baseUrl
                }
            };

            let self = this;
            return self.get('authRequest').send(url, options)
                .then(rep => {
                    self.set('error', false);
                    self.set('num_results', rep.length);
                    self.datasources.pushObjects(rep);

                    if(rep.length === 1) {
                        let name = self.datasources[0].name;
                        let dataId = self.datasources[0].dataId;
                        Ember.run.later(self, function() {
                            Ember.$('#harvester-dropdown').dropdown('set text', name);
                            Ember.$('#harvester-dropdown').dropdown('set value', dataId);
                        }, 250);
                    }
                    else {
                        Ember.$('#harvester-dropdown').dropdown('set visible');
                        Ember.$('#harvester-dropdown').dropdown('set active');
                        let menu = Ember.$('#harvester-dropdown .menu');
                        menu.removeClass('hidden');
                        menu.addClass('transition visible');
                    }
                })
                .catch(e => {
                    console.log("Error: " + e);
                    self.set('error', true);
                    self.set('errorMessage', 'No matching results found.');
                    self.disableRegister();
                })
                .finally((_) => {
                    self.set('searching', false);
                });
        }
    }
});
