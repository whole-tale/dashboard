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
    // Holds an object that represents files that can be excluded from publishing
    mutableFiles: Ember.A(),
    // Holds an array of objects that cannot be excluded from publishing
    immutableFiles: Ember.A(),
    publishingLocations: Ember.A(),
    enablePublish: true,
    selectedRepository: '',

    setPublishBtnState(state) {
        this.set('enablePublish', state);
    },

    actions: {
        publishTale: function() {
            console.log(this.selectedRepository)
        },

        cancelPublish: function() {
            console.log('Canceling');
        },
    },
});
