import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';

import config from '../../config/environment';

export default Ember.Component.extend({
    layout,
    authRequest: Ember.inject.service(),
    tokenHandler: Ember.inject.service(),

    datasources: Ember.A(),

    searchDataId: '',
    dataId: '',
    doi: '',
    name: '',
    repository: '',
    size: '',

    dataMut: Ember.observer('data', function() {
        let dataId = this.get('data');
        if(!dataId) return;
        let ds = this.datasources.find(ds => {
            return (dataId == ds.dataId || dataId == ds.doi);
        });

        this.set('dataId', ds.dataId);
        this.set('doi', ds.doi);
        this.set('name', ds.name);
        this.set('repository', ds.repository);
        this.set('size', ds.size);
    }),

    disableRegister() {
        Ember.$('.icon.register').removeClass('checkmark');
        Ember.$('.ui.positive.register.button').addClass('disabled');
        this.clearModal();
    },

    enableRegister() {
        Ember.$('.icon.register').addClass('checkmark');
        Ember.$('.ui.positive.register.button').removeClass('disabled');
    },

    clearModal() {
        Ember.$('.ui.dropdown').dropdown('clear');
        this.set('datasources', Ember.A());
        this.datasources.arrayContentDidChange();
        this.set('dataId', '');
        this.set('doi', '');
        this.set('name', '');
        this.set('repository', '');
        this.set('size', '');
    },

    actions: {
        register() {
            this.disableRegister();
        },

        cancel() {
            // Ember.$('.ui.modal').modal('hide');
            this.disableRegister();
        },

        search() {

            let url = config.apiUrl + '/repository/lookup';
            let options = {
                method: 'GET',
                data: {
                    dataId: this.searchDataId
                }
            };

            let self = this;
            return self.get('authRequest').send(url, options)
                .then(rep => {
                    console.log(rep);
                    self.datasources.pushObjects(rep);
                    self.datasources.arrayContentDidChange();
                    self.enableRegister();
                })
                .catch(e => {
                    console.log(e);
                    self.disableRegister();
                })
                .finally((_) => {});
        }
    }
});
