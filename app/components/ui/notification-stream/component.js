// app/pods/components/notification-stream/component.js
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import $ from 'jquery';
import layout from './template';

// Load a polyfill for EventSource to allow passing custom headers (e.g. token)
const EventSource = window.EventSourcePolyfill;

export default Component.extend({
    layout,
    notificationStream: service('notification-stream'),
    
    apiCall: service('api-call'),
    store: service(),
    logInterval: null,
    
    events: A([]),
    source: null,
    selectedEvent: null,
    selectedEventLogs: [],
    
    didInsertElement() {
        const self = this;
        const source = self.get('notificationStream').connect();
        
        source.onopen = () => console.log("Connected to event server.");
        source.onmessage = self.onMessage.bind(this);
        source.onerror = (err) => {
            console.log("EventSource failed:", err);
            this.get('notificationStream').close();
        };
        
        self.set('source', source);
        self.set('events', A([]));
    },
    
    willDestroyElement() {
        const self = this;
        let source = self.get('source');
        if (source) {
            source.close();
        }
        
        self.set('events', A([]));
        self.set('source', null);
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
            events.unshiftObject(event);
            self.set('events', events);
            //console.log("New event:", events);
        } else {
            //console.log("Ignoring event:", event);
        }
    },
        
    fetchLogs() {
        const self = this;

        const event = self.get('selectedEvent');
        self.get('store').findRecord('job', event.json.data.imageInfo.jobId).then(job => {
            self.set('selectedEventLogs', job.log);
        });
    },
    
    // Clear log refresh interval, if one exists
    clearLogInterval() {
        const self = this;
        let interval = self.get('logInterval');
        if (interval) {
            clearInterval(interval);
            interval = null;
            self.set('logInterval', null);
        }  
    },
    
    actions: {
        markAllAsRead() {
            const self = this;
            self.get('notificationStream').markAllAsRead();
            self.set('events', A([]));
        },
        
        restartTaleInstance(tale) {
            const self = this;
            const adapterOptions = { queryParams: { limit: "0" } };
            self.get('store').query('instance', { reload: false, backgroundReload: false, adapterOptions }).then(instances => {
                instances.forEach(instance => {
                    if (tale._id == instance.taleId) {
                        self.get('apiCall').restartInstance(instance);
                    }
                });
            });
        },
        
        // Fetch job logs and trigger auto-refresh every 2 seconds
        openLogViewerModal(event) {
            const self = this;
            
            self.set('selectedEvent', event);
            
            // Clear log refresh interval, if one already exists
            self.clearLogInterval();
            
            // Trigger initial fetch
            self.fetchLogs();
            
            // Trigger auto-refresh every 2 seconds
            let interval = setInterval(self.fetchLogs.bind(self), 1000);
            self.set('logInterval', interval);
            
            // Show the log viewer modal
            $('#log-viewer-modal').modal('show');
        },
        
        // Clears log viewer state and hides the modal
        closeLogViewerModal(event) {
            const self = this;
            self.clearLogInterval();
            self.set('selectedEvent', null);
            self.set('selectedEventLogs', []);
            $('#log-viewer-modal').modal('hide');
        },
    }
});
 
