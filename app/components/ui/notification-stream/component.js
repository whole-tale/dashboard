// app/pods/components/markdown-component/component.js
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
    layout,
    notificationStream: service('notification-stream'),
    
    events: [
        { 'subject': 'Tale A', 'message': 'build now in progress.', 'date': new Date(), 'counter': 0, 'icon': 'fa-cog fa-spin' },
        { 'subject': 'Tale B', 'message': 'build now in progress.', 'date': new Date(), 'counter': 1 },
        { 'subject': 'Tale A', 'message': 'build now in progress.', 'date': new Date(), 'counter': 2 },
    ],
    source: null,
    
    didInsertElement() {
        const self = this;
        self.set('source', this.get('notificationStream').connect());
        //self.set('events', []);
    },
    willDestroyElement() {
        const self = this;
        let source = self.get('source');
        if (source) {
            source.close();
        }
        
        self.set('source', null);
        //self.set('events', []);
    },
    generateEvent(taleName, message) {
        let counter = this.get('events').length;
        return { 'subject': taleName, 'message': message, 'date': new Date(), 'counter': counter };
    },
    pushGeneratedEvent() {
        let event = this.generateEvent('Tale A', 'build now in progress.');
        this.get('events').push(event);
    }
});
 
