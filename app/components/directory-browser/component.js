import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,
    actions: {
      clickedFile : function(itemID, itemName, ) {
        this.sendAction('action', itemID,  itemName, "false");
    },
      clickedFolder : function(itemID, itemName) {
        this.sendAction('action', itemID,  itemName, "true");
      }

    }
});
