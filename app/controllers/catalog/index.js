import Ember from 'ember';

export default Ember.Controller.extend({
    notificationHandler: Ember.inject.service(),
    folderNavs: Ember.inject.service(),

    catalogItems: {
        all:  Ember.A(),
        mine: Ember.A(),
        used: Ember.A()
    },

    paginateArray: Ember.A([{state:'active', number:1},]),

    leftButtonState: "disabled",
    rightButtonState: "disabled",

    init() {
        this._super(...arguments);

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
        viewMetadata(item) {
            this.transitionToRoute("folder.view", item);
        },
        copyToHome(item) {
            let folderNavs = this.get('folderNavs');
            let homeNav = folderNavs.getFolderNavFor("home");

            let q = {
                parentType: homeNav.parentType,
                parentId: homeNav.parentId
            };

            let notification, notifier = this.get('notificationHandler');

            item.save({adapterOptions: {copy: true, queryParams: q}})
                .then(_ => notification={message:"Finished Copying Data", header: "Success"})
                .catch(e => {
                    let message = e.message || e.responseText;
                    notification={message: message, header: "Failed"};
                })
                .finally(_ => notifier.pushNotification(notification));
        }
    }
});
