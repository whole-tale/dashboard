import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    actions: {
        collectionClicked : function(collectionID, collectionName) {
            this.sendAction('action', collectionID, collectionName);
        }
    }
});
