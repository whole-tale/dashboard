import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,
  showEditor : false,
    actions: {
      clickedFolder : function(item) {
        this.sendAction('action', item,  "true");
      },
      clickedFile: function(item) {
        this.sendAction('action', item, "false");
      },
    }
});
