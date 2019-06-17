// app/pods/components/notification-stream/component.js
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import config from '../../../config/environment';
import $ from 'jquery';
import layout from './template';

export default Component.extend({
    layout,
    
    notificationStream: service('notification-stream'),
    apiCall: service('api-call'),
    store: service(),
    
    logInterval: null,
    DEBUG: config.dev,
    
    source: null,
    selectedEvent: null,
    selectedEventLogs: [],
    
    didInsertElement() {
        const self = this;
        const source = self.get('notificationStream').connect();
        
        self.set('source', source);
    },
    
    willDestroyElement() {
        const self = this;
        let source = self.get('source');
        if (source) {
            source.close();
        }
        
        self.set('source', null);
    },
        
    fetchLogs() {
        const self = this;

        const event = self.get('selectedEvent');
        self.get('store').findRecord('job', event.data.resource.jobs[0]).then(job => {
            if (job && job.log) {
                self.set('selectedEventLogs', job.log.join(''));
            }
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
        toggleShowNotifications() {
            this.notificationStream.toggleShowNotifications();
        },
        
        togglePastEvents() {
            this.notificationStream.togglePastEvents();
        },
    
        hideMessage(event) {
            const self = this;
            self.get('notificationStream').hideMessage(event);
        },
        
        markAllAsRead() {
            const self = this;
            self.get('notificationStream').markAllAsRead();
        },
        
        restartTaleInstance(tale) {
            const self = this;
            const adapterOptions = { queryParams: { limit: "0", taleId: tale._id } };
            self.get('store').query('instance', { 
                reload: false, 
                backgroundReload: false, 
                adapterOptions 
            }).then(instances => {
                instances.forEach(instance => {
                    self.get('apiCall').restartInstance(instance);
                });
            });
        },
        
        // Fetch job logs and trigger auto-refresh every 2 seconds
        openLogViewerModal(event) {
            const self = this;
            
            self.set('selectedEvent', EmberObject.create(event));
            
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
        
        gotoTale(taleId) {
           this.router.transitionTo('run.view', taleId); 
        },
    }
});
 
