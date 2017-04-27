import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,

    notificationHandler: Ember.inject.service('notification-handler'),

    notificationHeader: 'Notification',
    notificationMessage: '',

    notificationTimeout: null,

    actions: {
        toggleNotification(notifMessage, notifHeader) {
            let notification = this.get('notificationHandler').getNotification();

            this.set('notificationHeader', notification.header);
            this.set('notificationMessage', notification.message);

            console.log(this);

            let notifier = Ember.$('.notifier');

            console.log(notifier);

            if(notifier.hasClass('hidden')) {
                console.log("here4");
                let t = window.setTimeout(this.actions.toggleNotification.bind(this), 1000*5);
                this.set('notificationTimeout', t);
            }
            else {
                window.clearTimeout(this.notificationTimeout);
            }

            console.log("here5");

            notifier.transition('fly down');
        }
    }
});
