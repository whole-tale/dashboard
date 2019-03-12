// app/pods/components/notification-stream/component.js
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import layout from './template';

// Load a polyfill for EventSource to allow passing custom headers (e.g. token)
const EventSource = window.EventSourcePolyfill;

export default Component.extend({
    layout,
    notificationStream: service('notification-stream'),
    
    events: A([]),
    source: null,
    
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
    
    generateEvent(taleName, message) {
        const self = this;
        let counter = self.get('events').length;
        return { 'subject': taleName, 'message': message, 'date': new Date(), 'counter': counter };
    },
    
    onMessage(event) {
        const self = this;
        // Parse event data (tale) into JSON
        event.json = JSON.parse(event.data);
        event.created = new Date(event.json._girderTime * 1000).toLocaleString();
        //console.log("Message recv'd:", event);
        
        // Push new event data
        let events = self.get('events');
        if (event.json.type == 'wt_image_build_status') {
            events.unshiftObject(event);
            self.set('events', events);
            console.log("New event:", events);
        } else {
            console.log("Ignoring event:", event);
        }
    },
    
    actions: {
        markAllAsRead() {
            const self = this;
            self.get('notificationStream').markAllAsRead();
            self.set('events', A([]));
        }
    }
});
 
