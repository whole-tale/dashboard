import Service from '@ember/service';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import config from '../config/environment';

// Load a polyfill for EventSource to allow passing custom headers (e.g. token)
const EventSource = window.EventSourcePolyfill;

export default Service.extend({
    tokenHandler: service('token-handler'),
    apiHost: config.apiHost,
    source: null,
    
    /* Connect if not connected, otherwise return existing instance */
    connect() {
        const source = this.get('source');
        if (source != null) {
            this.close();
            console.log("Reconnecting...");
        } else {
            console.log("Connecting...");
        }
        
        
        const token = this.get('tokenHandler').getWholeTaleAuthToken();
        const endpoint = this.get('apiHost') + '/api/v1/notification/stream';
        const newSource = new EventSource(endpoint, {
          headers: {
            'Girder-Token': token
          }
        });
        
        newSource.onopen = this.onOpen.bind(this);
        newSource.onmessage = this.onMessage.bind(this);
        newSource.onerror = this.onError.bind(this);
        
        this.set('source', newSource);
        
        return newSource;
    },
    
    /* Close if possible, otherwise noop */
    close() {
        let source = this.get('source');
        if (source) {
            console.log('Closing connection...');
            source.close();
        }
    },
    
    onOpen() {
        console.log("Connection to server opened.")
    },
    onMessage(event) {
        //console.log("Message recv'd:", event);
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
});
