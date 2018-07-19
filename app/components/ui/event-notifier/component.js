import Ember from 'ember';
import layout from './template';
import guid from 'npm:guid';

const NOTIFICATION_DELAY = 10 * 1000;  // Default 10 seconds

export default Ember.Component.extend({
    layout,

    notificationHandler: Ember.inject.service('notification-handler'),

    notifications: Ember.A([null,null,null,null,null]),

    slot: 0,

    clearNotif(slot) {
      const elem = Ember.$(`#notif_${slot}`);
      elem.transition('fly down');

      const notifs = this.get('notifications').toArray();
      notifs[slot] = null;
      this.set('notifications', notifs);
    },

    addNotif(notif, slot) {
      const notifs = this.get('notifications').toArray();
      notifs[slot] = notif;
      this.set('notifications', notifs);

      const elem = Ember.$(`#notif_${slot}`);
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

        if (notifs[nextSlot] !== null) {
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
