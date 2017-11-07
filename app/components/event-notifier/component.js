import Ember from 'ember';
import layout from './template';
import guid from 'npm:guid';

const NOTIFICATION_DELAY = 10 * 1000;  // Default 10 seconds

export default Ember.Component.extend({
    layout,

    notificationHandler: Ember.inject.service('notification-handler'),

    notificationHeader: 'Notification',
    notificationMessage: '',

    notificationTimeout: null,

    notifications: Ember.A(),

    didInsertElement() {
      $('.message .close')
        .on('click', function() {
          $(this)
            .closest('.message')
            .transition('fade')
          ;
        })
      ;
    },

    clearNotif() {
      let notifs = this.get('notifications');
      if (!notifs.length) { return; }

      let oldNotif = notifs.shift();
      
      if (notifs.length) {
        let t = window.setTimeout(this.clearNotif.bind(this), NOTIFICATION_DELAY);
        this.set('notificationTimeout', t);
      } else {
        this.set('notificationTimeout', null);
      }
      
      Ember.$(`.${oldNotif.guid}`).transition('fade');

      this.set('notifications', notifs);
      this.get('notifications').arrayContentDidChange();

    },

    actions: {
      toggleNotification(notifMessage, notifHeader) {
        let notification = this.get('notificationHandler').getNotification();

        let notifs = this.get('notifications');
        let oldNotif, newNotif = { header: notification.header, message: notification.message, guid: guid.create(), hidden: 'hidden' };
        if (notifs.length > 5) {
          oldNotif = notifs.shift();
          Ember.$(`.${oldNotif.guid}`).transition('fade');
        }

        notifs.push(newNotif);

        this.set('notifications', notifs);
        this.get('notifications').arrayContentDidChange();
        
        let t = this.get('notificationTimeout');
        if (!t) {
          t = window.setTimeout(this.clearNotif.bind(this), NOTIFICATION_DELAY);
          this.set('notificationTimeout', t);
        }
      }
    }
});
