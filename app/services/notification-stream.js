import Service from '@ember/service';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import config from '../config/environment';

const DEBUG = config.dev;
const VERBOSE = false;
const dayMs = 24 * 60 * 60 * 1000;

export default Service.extend({
    apiHost: config.apiHost,
    tokenHandler: service('token-handler'),
    timeout: 3600,
    source: null,
    store: service(),
    apiCall: service('api-call'),
    events: A([]),
    lastMessage: null,
    
    allEvents: computed('events', 'pastEvents', 'lastMessage', function() {
        if (this.showPastEvents) {
            return this.events.concat(this.pastEvents.filter((event) => {
                // Avoid displaying the same event as both current and past
                return !this.events.find(evt => evt._id === event._id);
            }));
        } else {
            return this.events;
        }
    }),
    
    showNotificationStream: false,
    showPastEvents: false,
    
    pastEvents: A([]),
    selectedFilter: 0,
    pastEventFilters: [
        {
            label: '7 Days',
            valueMs: 7 * dayMs
        },
        {
            label: '3 Days',
            valueMs: 3 * dayMs
        },
        {
            label: 'Today',
            valueMs: 1 * dayMs
        }
        
    ],
    
    filterObserver: observer('showPastEvents', 'selectedFilter', function() {
        const self = this;
        const deltaMs = this.pastEventFilters[this.selectedFilter].valueMs;
        const sinceMs = Date.now() - deltaMs;
        self.apiCall.getPastNotifications(sinceMs).then(events => {
            let sorted = events.sort((e1, e2) => {
              // This is a comparison function that will result in dates being sorted in
              // DESCENDING order.
              if (e1.updatedTime > e2.updatedTime) return -1;
              if (e1.updatedTime < e2.updatedTime) return 1;
              return 0;
            });
            events.forEach(self.attachTaleData.bind(self));
            self.set('pastEvents', sorted);
        });
    }),
    
    toggleShowNotifications() {
        this.set('showNotificationStream', !this.showNotificationStream);
    },
    
    togglePastEvents() {
        this.set('showPastEvents', !this.showPastEvents);
    },
    
    
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
            self.close();
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
        if (source != null && source.readyState != EventSource.CLOSED) {
            DEBUG && VERBOSE && console.log('Closing connection...');
            source.close();
        }
    },
    
    hideMessage(event) {
        event.hidden = true;
    },
    
    
    attachTaleData(event) {
        const self = this;  
        
        // Short-circuit if this event does not contain a resource
        if (!event.data.resource) {
            return;
        }
        
        // Attempt to use instanceId/taleId to attach the tale to its related event
        const taleId = event.data.resource.tale_id;
        const instanceId = event.data.resource.instance_id;
        if (taleId) {
            event.data.resource.tale = self.store.peekRecord('tale', taleId);
        } else if (instanceId) { 
            // XXX: this branch shouldn't be necessary, "restart tale" should send us tale_id as well
            const instance = self.store.peekRecord('instance', instanceId);
            if (instance) {
                event.data.resource.tale = self.store.peekRecord('tale', instance.taleId);
            } else {
                event.data.resource.tale = { title: 'ERROR: Tale not found' }
                self.store.findRecord('instance', instanceId).then(instance => {
                    event.data.resource.tale = self.store.peekRecord('tale', instance.taleId);
                });
            }
        } else {
            console.log('Warning: Unable to attach tale data to notification_id=' + event._id);
        }
    },
    
    onMessage(event) {
        const self = this;
        
        self.set('lastMessage', Date.now());
        
        // Parse event data (tale) into JSON
        event = JSON.parse(event.data);
        
        // Push new event data
        const events = self.get('events');
        if (event.type == 'wt_progress' && event.data.resource.type.startsWith('wt_')) {
            console.log(`Notification (${event._id}): progress update: ${event.data.message} - ${event.data.current}/${event.data.total}`, event);
        
            this.attachTaleData(event);
            
            // Determine if we already have a notification regarding this Tale
            let existing = events.find(evt => event._id === evt._id);
            if (existing && event.updated > existing.updated) {
                // Overwrite existing current event with new one
                events.replace(events.indexOf(existing), 1, event);
                console.log(`Notification (${event._id}): updated unread event`, events);
                
                // Overwrite existing past event with new one
                if (self.showPastEvents) {
                    const pExisting = self.pastEvents.find(evt => event._id === evt._id);
                    if (pExisting) {
                        self.pastEvents.replace(self.pastEvents.indexOf(pExisting), 1, event);
                        console.log(`Notification (${event._id}): updated read event`, events);
                    }
                }
            } else if (!existing) {
                // Add a new event
                events.unshiftObject(event);
                console.log(`Notification (${event._id}): new unread event`, events);
                
                if (self.showPastEvents) {
                    self.pastEvents.unshiftObject(event);
                }
            }
            self.set('events', events);
            self.set('showNotificationStream', true);
        } else {
            //console.log(`Ignored notification (${event._id}): Job event (${event.data._id}) encountered: ${event.data.title} -> ${event.data.status}`, event);
        }
    },
});
