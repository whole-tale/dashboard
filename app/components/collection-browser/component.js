import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    actions: {
        collectionClicked : function(collectionID, collectionName) {
            this.sendAction('action', collectionID, collectionName);
        },
        openModal() {
            let modal = Ember.$('.ui.harvester.modal');
            modal.parent().prependTo(Ember.$(document.body));
            modal.modal('show');
        }
    }
});
