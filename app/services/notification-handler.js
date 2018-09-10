import Service from '@ember/service';
import $ from 'jquery';
import { computed } from '@ember/object';

export default Service.extend({
  notification: computed(function () {
      return {
        message: '',
        header: 'Notification'
      };
  }),
  notifyInterval: null,

  pushNotification(notif) {
    let notifs = this.getNotifications();
    notifs.push(notif);
    this.setNotifications(notifs);
    if (!this.notifyInterval) {
      this.notify();
      this.set('notifyInterval', setInterval(this.notify.bind(this), 6000));
    }
  },
  getNotifications() {
    let notifs = localStorage.getItem('notifications');
    if (!notifs) {
      return [];
    } else {
      return JSON.parse(notifs);
    }
  },
  setNotifications(notifs) {
    localStorage.setItem('notifications', JSON.stringify(notifs));
  },
  notify() {
    let notifs = this.getNotifications();

    let eventNotifier = $('#add-notify');
    let next = notifs.shift();

    if (next) {
      try {
        this.setNotification(next);
        // if(Ember.$('.notifier').hasClass('visible')) eventNotifier.click();
        eventNotifier.click();
        this.setNotifications(notifs);
      } catch (e) {
        // console.log(e);
      }
    } else {
      window.clearInterval(this.notifyInterval);
      this.set('notifyInterval', null);
    }
  },
  getNotification() {
    let notif = localStorage.getItem('notification');
    if (!notif) {
      return this.notification;
    } else {
      return JSON.parse(notif);
    }
  },
  setNotification(notif) {
    localStorage.setItem('notification', JSON.stringify(notif));
  },
  clearNotifications() {
    localStorage.setItem('notification', JSON.stringify(this.notification));
    localStorage.setItem('notifications', JSON.stringify([]));
  }
});
