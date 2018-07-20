import Ember from 'ember';

export default Ember.Component.extend({
    notificationHandler: Ember.inject.service(),
    folderNavs: Ember.inject.service(),
    router: Ember.inject.service(),

    catalogItems: {
        all:  Ember.A(),
        mine: Ember.A(),
        used: Ember.A()
    },

    paginateArray: Ember.A([{state:'active', number:1},]),

    leftButtonState: "disabled",
    rightButtonState: "disabled",

    didInsertElement() {
        console.log(this.catalogItems);
        this._super(...arguments);
        
        Ember.run.later(function() {
            $('.menu .item')
                .tab()
            ;
            $('.item .blurring')
              .dimmer({
                on: 'hover'
              })
            ;
        }, 1);
        
        //TODO: Build the paginationArray
    },

    actions: {
        // --------------------------------------------------------------------
        openModal(modalName) {
          let modal = Ember.$('.ui.'+modalName+'.modal');
          modal.parent().prependTo(Ember.$(document.body));
          modal.modal('show');
        },
        // --------------------------------------------------------------------
        leftButtonClicked() {

        },
        // --------------------------------------------------------------------
        rightButtonClicked() {

        },
        // --------------------------------------------------------------------
        tabClicked() {

        },
        // --------------------------------------------------------------------
        copyToHome(item) {
            let folderNavs = this.get('folderNavs');
            let homeNav = folderNavs.getFolderNavFor("home");

            let data = item.toJSON();

            let notification, notifier = this.get('notificationHandler');

            item.save({adapterOptions: {copy: true, data: data}})
                .then(_ => notification={message:"Finished Copying Data", header: "Success"})
                .catch(e => {
                    let message = e.message || e.responseText;
                    notification={message: message, header: "Failed"};
                })
                .finally(_ => notifier.pushNotification(notification));
        }
    }
});
