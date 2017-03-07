import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,
    showEditor : false,
    menuItems: [
        {name:"move", label:"Move To...", icon:"folder"},
        {name:"rename", label:"Rename...", icon:"write square"},
        {separator:true},
        {name:"copy", label:"Copy", icon:"clone"},
        {name:"download", label:"Download", icon:"download"},
        {separator:true},
        {name:"remove", label:"Remove", icon:"trash"}
    ],
    selectedTarget: null,
    didRender() {
        let self = this;
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
                self.set('selectedTarget', selected);
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
        closedContextMenu: function() {
            let ctxt = Ember.$('#directory-context-menu');
            ctxt.addClass('hidden');
        },
        clickedContextMenuItem: function(menuItem) {
            let fileId = this.selectedTarget.id;
        }
    }
});
