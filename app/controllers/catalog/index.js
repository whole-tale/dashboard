import Ember from 'ember';

export default Ember.Controller.extend({
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
    }
});
