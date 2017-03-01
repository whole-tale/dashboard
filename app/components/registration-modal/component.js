import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';

import config from '../../config/environment';

export default Ember.Component.extend({
    layout,
    authRequest: Ember.inject.service(),
    tokenHandler: Ember.inject.service(),

    datasources: Ember.A(),

    num_results: -1,
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
        Ember.$('.ui.dropdown').dropdown('clear');
        this.set('datasources', Ember.A());
        this.set('num_results', -1);
        this.set('dataId', '');
        this.set('doi', '');
        this.set('name', '');
        this.set('repository', '');
        this.set('size', '');
    },

    didRender() {
        let self = this;
        Ember.$('.ui.dropdown').dropdown({
            onChange: function(dataId) {
                if(!dataId || dataId === "") {
                    self.disableRegister();
                    return;
                }
                self.enableRegister(dataId);
            }
        });
    },

    actions: {
        register() {
            this.clearModal();
            this.disableRegister();
        },

        cancel() {
            this.clearModal();
            this.disableRegister();
        },

        search() {
            this.set('searching', true);

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
                    self.set('num_results', rep.length);
                    self.datasources.pushObjects(rep);
                    if(rep.length === 1) {
                        Ember.$('.ui.dropdown').dropdown('set text', self.datasources[0].name);
                        Ember.$('.ui.dropdown').dropdown('set value', self.datasources[0].dataId);
                    }
                    else {
                        Ember.$('.ui.dropdown').dropdown('set visible');
                        Ember.$('.ui.dropdown').dropdown('set active');
                        let menu = Ember.$('.ui.dropdown .menu');
                        menu.removeClass('hidden');
                        menu.addClass('transition visible');
                    }
                })
                .catch(e => {
                    console.log(e);
                    self.disableRegister();
                })
                .finally((_) => {
                    self.set('searching', false);
                });
        }
    }
});
