import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    selectedFile: null,
    actions: {
      collectionClicked : function(collectionID, collectionName) {
        this.sendAction('collectionClicked', collectionID, collectionName );
      }
    }
});
