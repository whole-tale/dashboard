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

            let notifier = Ember.$('.notifier');

            if(notifier.hasClass('hidden')) {
                let t = window.setTimeout(this.actions.toggleNotification.bind(this), 1000*3);
                this.set('notificationTimeout', t);
            }
            else {
                window.clearTimeout(this.notificationTimeout);
            }

            notifier.transition('fly down');
        }
    }
});
