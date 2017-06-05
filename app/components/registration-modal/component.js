import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';
import EventStream from 'npm:sse.js';

import config from '../../config/environment';

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
    size: '',

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
        Ember.$('#harvester-dropdown').dropdown('clear');
        Ember.$('#results').addClass('hidden');
        Ember.$('#searchbox').val('');

        this.set('datasources', Ember.A());
        this.set('error', false);
        this.set('errorMessage', '');
        this.set('num_results', -1);
        this.set('dataId', '');
        this.set('doi', '');
        this.set('name', '');
        this.set('repository', '');
        this.set('size', '');
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

    actions: {
        register() {
            this.set('error', false);

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

            let url = config.apiUrl + '/folder/register' + queryParams;
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
                        message: "To see a stack trace of what went wrong click <button onclick=\"alert(1);\">here</button>"
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
            this.clearModal();
            this.set('searching', true);
            Ember.$('#results').removeClass('hidden');

            let url = config.apiUrl + '/repository/lookup';
            let options = {
                method: 'GET',
                data: {
                    dataId: JSON.stringify(this.searchDataId.split())
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
