import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import config from '../config/environment';

// Load a polyfill for EventSource to allow passing custom headers (e.g. token)
const EventSource = window.EventSourcePolyfill;

export default Service.extend({
    apiHost: config.apiHost,
    tokenHandler: service('token-handler'),
    
    source: null,
    
    /* Connect if not connected, otherwise return existing instance */
    connect() {
        const self = this;
        const source = self.get('source');
        if (source != null) {
            console.log("Reconnecting...");
            this.close();
        }
        
        // Only fetch message since our last acknowledgement
        const lastRead = localStorage.getItem('lastRead');
        const suffix = lastRead ? '?since=' + encodeURIComponent(lastRead) : '';
        
        // Connect to Girder's notification stream endpoint for SSE
        console.log("Connecting...");
        const endpoint = self.get('apiHost') + '/api/v1/notification/stream' + suffix;
        const newSource = new EventSource(endpoint, {
          headers: {
            'Girder-Token': self.get('tokenHandler').getWholeTaleAuthToken()
          }
        });
        
        self.set('source', newSource);
        
        return newSource;
    },
    
    markAllAsRead() {
        let rightNow = Math.round(new Date().getTime() / 1000);
        console.log('Setting lastRead = ', rightNow);
        localStorage.setItem('lastRead', rightNow);
        
        // Reconnect
        this.connect();
    },
    
    /* Close if possible, otherwise noop */
    close() {
        const self = this;
        let source = self.get('source');
        if (source != null && source.readyState == EventSource.CLOSED) {
            console.log('Closing connection...');
            source.close();
        }
    },
});
