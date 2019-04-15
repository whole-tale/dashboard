import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import config from '../config/environment';

const DEBUG = config.dev;
const VERBOSE = false;

export default Service.extend({
    apiHost: config.apiHost,
    tokenHandler: service('token-handler'),
    timeout: 3600,
    source: null,
    events: A([]),
    
    showNotificationStream: false,
    
    /* Connect if not connected, otherwise return existing connection */
    connect() {
        const self = this;
        const source = self.get('source');
        if (source != null) {
            DEBUG && VERBOSE && console.log("Reconnecting...");
            this.close();
        }
        
        // Only fetch message since our last acknowledgement
        const lastRead = localStorage.getItem('lastRead');
        const tokenQSP = 'token=' + self.get('tokenHandler').getWholeTaleAuthToken();
        const timeoutQSP = 'timeout=' + self.timeout;
        const sinceQSP = lastRead ? 'since=' + encodeURIComponent(lastRead) : ''
        const querystring = `?${tokenQSP}&${timeoutQSP}&${sinceQSP}`;
        
        // Connect to Girder's notification stream endpoint for SSE
        DEBUG && VERBOSE && console.log("Connecting...");
        const endpoint = self.get('apiHost') + '/api/v1/notification/stream' + querystring;
        const newSource = new EventSource(endpoint);
        
        newSource.onopen = () => DEBUG && console.log("Connected to event server.");
        newSource.onmessage = self.onMessage.bind(self);
        newSource.onerror = (err) => {
            (console && console.error && console.error("EventSource failed:", err))
                || console.log("EventSource failed:", err);
            self.get('notificationStream').close();
        };  
        
        self.set('source', newSource);
        
        return newSource;
    },
    
    /* Updates "lastRead" to now, then reconnects */
    markAllAsRead() {
        let rightNow = Math.round(new Date().getTime() / 1000);
        DEBUG && console.log('Setting lastRead = ', rightNow);
        localStorage.setItem('lastRead', rightNow);
        
        // TODO: Maintain a history of acknowledged alerts?
        this.set('events', A([]));
        this.set('showNotificationStream', false);
        
        // Reconnect with new parameters
        this.connect();
    },
    
    /* Close if possible, otherwise noop */
    close() {
        const self = this;
        let source = self.get('source');
        if (source != null && source.readyState == EventSource.CLOSED) {
            DEBUG && VERBOSE && console.log('Closing connection...');
            source.close();
        }
    },
    
    onMessage(event) {
        const self = this;
        // Parse event data (tale) into JSON
        event.json = JSON.parse(event.data);
        event.created = new Date(event.json.time).toLocaleString();
        //console.log("Message recv'd:", event);
        
        // Push new event data
        let events = self.get('events');
        if (event.json.type == 'wt_image_build_status') {
            // TODO: Handle updates to previous events
            events.unshiftObject(event);
            self.set('events', events);
            console.log("New event:", events);
            self.set('showNotificationStream', true);
        } else if (event.json.type == 'wt_error_backend_generic') {
            // NOTE: This is currently unused
            console.log("Generic backend encountered:", event);
        } else {
            console.log("Ignored event type encountered:", event);
        }
    },
});
