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
    store: service(),
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
        const rightNow = Math.round(new Date().getTime() / 1000);
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
        const source = self.get('source');
        if (source != null && source.readyState == EventSource.CLOSED) {
            DEBUG && VERBOSE && console.log('Closing connection...');
            source.close();
        }
    },
    
    hideMessage(event) {
        event.hidden = true;
    },
    
    onMessage(event) {
        const self = this;
        
        // Parse event data (tale) into JSON
        event.json = JSON.parse(event.data);
        event.created = new Date(event.json.time).toLocaleString();
        event.updated = new Date(event.json.updated).toLocaleString();
        
        // Push new event data
        const events = self.get('events');
        if (event.json.type == 'wt_progress' && event.json.data.resource.type.startsWith('wt_')) {
            console.log(`Notification (${event.json._id}): progress update: ${event.json.data.message} - ${event.json.data.current}/${event.json.data.total}`, event);
        
            // Attempt to use instanceId/taleId to attach the tale to its related event
            const taleId = event.json.data.resource.tale_id;
            const instanceId = event.json.data.resource.instance_id;
            if (taleId) {
                this.store.findRecord('tale', taleId).then((tale) => {
                    event.json.data.resource.tale = tale;
                });
            } else if (instanceId) {
                this.store.findRecord('instance', instanceId).then((instance) => {
                    this.store.findRecord('tale', instance.taleId).then((tale) => {
                        event.json.data.resource.tale = tale;
                    });
                });
            } 
            
            // Determine if we already have a notification regarding this Tale
            let existing = events.find(evt => event.json._id === evt.json._id);
            if (existing && event.updated > existing.updated) {
                // Overwrite existing event with new one
                const index = events.indexOf(existing);
                events.replace(index, 1, event);
                console.log(`Notification (${event.json._id}): updated event`, events);
            } else if (!existing) {
                // Add a new event
                events.unshiftObject(event);
                console.log(`Notification (${event.json._id}): new event`, events);
            }
            self.set('events', events);
            self.set('showNotificationStream', true);
        } else if (event.json.data.message) {
            // Handle displaying progress updates for tasks
        } else if (event.json.data.text) {
            // Handle build log updates
            // FIXME: Why are these sent as notifications? 
            // FIXME: These logs are not displayed in the UI, and are currently fetched on demand when requested
            //console.log(`Notification (${event.json._id}): Log update encountered: ${event.json.data.text}`, event);
        } else {
            //console.log(`Ignored notification (${event.json._id}): Job event (${event.json.data._id}) encountered: ${event.json.data.title} -> ${event.json.data.status}`, event);
        }
    },
});
