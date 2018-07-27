import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import $ from 'jquery';

const NOTIFICATION_DELAY = 10 * 1000;  // Default 10 seconds

export default Component.extend({
    layout,

    notificationHandler: service('notification-handler'),
    notifications: A([null,null,null,null,null]),

    slot: 0,

    clearNotif(slot) {
      const elem = $(`#notif_${slot}`);
      elem.transition('fly down');

      const notifs = this.get('notifications').toArray();
      notifs[slot] = null;
      this.set('notifications', notifs);
    },

    addNotif(notif, slot) {
      const notifs = this.get('notifications').toArray();
      notifs[slot] = notif;
      this.set('notifications', notifs);

      const elem = $(`#notif_${slot}`);
      elem.transition('fly up');
    },

    beginNotificationTimeout(slot) {
      window.setTimeout(this.clearNotif.bind(this, slot), NOTIFICATION_DELAY);
    },

    actions: {
      toggleNotification() {
        let notification = this.get('notificationHandler').getNotification();

        let notifs = this.get('notifications').toArray();
        let nextSlot = this.get('slot');

        if (notifs && notifs[nextSlot]) {
          this.clearNotif(nextSlot);
        }

        let newNotif = { 
          header: notification.header, 
          message: notification.message, 
        };
        this.addNotif(newNotif, nextSlot);
        
        this.beginNotificationTimeout(nextSlot);
        this.set('slot', (nextSlot+1)%5);
      }
    }
});
