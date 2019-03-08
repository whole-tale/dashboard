// app/pods/components/markdown-component/component.js
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import config from '../../../config/environment';
import layout from './template';
import JSONBeautify from 'npm:json-beautify';

const EventSource = window.EventSourcePolyfill;

export default Component.extend({
    layout,
    tokenHandler: service('token-handler'),
    
    apiHost: config.apiHost,
    events: [
        { 'subject': 'Tale A', 'message': 'build now in progress.', 'date': new Date(), 'counter': 0, 'icon': 'fa-cog fa-spin' },
        { 'subject': 'Tale B', 'message': 'build now in progress.', 'date': new Date(), 'counter': 1 },
        { 'subject': 'Tale A', 'message': 'build now in progress.', 'date': new Date(), 'counter': 2 },
    ],
    source: null,
    
    init() {
        const self = this;
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let endpoint = self.get('apiHost') + '/api/v1/notification/stream';
        let es = new EventSource(endpoint, {
          headers: {
            'Girder-Token': token
          }
        });
        
        es.onopen = self.onOpen.bind(self);
        es.onmessage = self.onMessage.bind(self);
        es.onerror = self.onError.bind(self);
        
        self.set('source', es);
        self.set('events', []);
    },
    onOpen() {
        console.log("Connection to server opened.")
    },
    onMessage(event) {
        console.log("Message recv'd:", event);
        let events = this.get('events');
        events.push(event);
        this.set('events', events);
        let json = JSON.parse(event.data)
        console.log("JSON data recv'd:", json);
        alert(event.data);
    },
    onError(error) {
        console.log("EventSource failed.");
        if (this.get('source').readyState == EventSource.CLOSED) return;
        console.error(error);
    },
    generateEvent() {
        let counter = this.get('events').length;
        return { 'subject': 'Tale A', 'message': 'build now in progress.', 'date': new Date(), 'counter': counter };
    },
    pushGeneratedEvent() {
        this.get('events').push(this.generateEvent());
    }
});
 
