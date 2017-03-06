import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,
    showEditor : false,
    didRender() {
        let contextMenuElements = Ember.$('.contextmenu');
        for(let i = 0; i < contextMenuElements.length; i++) {
            let element = contextMenuElements[i];
            element.oncontextmenu = function(mouseEvent) {
                let ctxt = Ember.$('#directory-context-menu');
                ctxt.css({
                    top: mouseEvent.layerY+"px",
                    left: mouseEvent.layerX+"px",
                    position: "absolute"
                });
                ctxt.removeClass("hidden");
                let selected = mouseEvent.path.find(offset => {
                    return /contextmenu/.test(offset.classList.value);
                });
                return false;
            };
        };
    },
    actions: {
      clickedFolder : function(item) {
        this.sendAction('action', item,  "true");
      },
      clickedFile: function(item) {
        this.sendAction('action', item, "false");
      },
      hide: function() {
          let ctxt = Ember.$('#directory-context-menu');
          ctxt.addClass('hidden');
      }
    }
});
