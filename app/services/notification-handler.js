import Ember from 'ember';


export default Ember.Service.extend({
    notification: {message:"", header:"Notification"},

    pushNotification(notif) {
        let notifs = this.getNotifications();
        notifs.push(notif);
        this.setNotifications(notifs);
    },
    getNotifications() {
        let notifs = localStorage.getItem('notifications');
        if(!notifs) {
            return [];
        }
        else {
            return JSON.parse(notifs);
        }
    },
    setNotifications(notifs) {
        localStorage.setItem('notifications', JSON.stringify(notifs));
    },
    notify() {
        let notifs = this.getNotifications();
        let next = notifs.shift();

        let eventNotifier = Ember.$('#event-notifier');

        if(next) {
            try {
                this.setNotification(next);
                if(Ember.$('.notifier').hasClass('visible')) eventNotifier.click();
                eventNotifier.click();
                this.setNotifications(notifs);
            }
            catch(e) {}
        }
    },
    getNotification() {
        let notif = localStorage.getItem('notification');
        if(!notif) {
            return this.notification;
        }
        else {
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
