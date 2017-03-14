import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),
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

    selectedItem: null,
    renaming: false,
    confirmDisabled: "disabled",

    didRender() {
        if(this.renaming) {
            var timer;

            let self = this;
            let cancelRenaming = function() {
                self.set("renaming", false);
                self.selectedItem.rollbackAttributes();
            }

            let input = this.selectedRow.find("input");

            input.focus();

            input.on("blur", function() {
                if(timer) window.clearTimeout(timer);
                timer = window.setTimeout(cancelRenaming, 200);
            });
        }
    },

    actions: {
        clickedFolder : function(item) {
            this.sendAction('action', item,  "true");
        },

        clickedFile: function(item) {
            this.sendAction('action', item, "false");
        },

        openedContextMenu(item) {
            this.send("closedPrompt", ".prompt");

            //unhide the context menu and position it close to where the user
            //right-clicked
            let ctxt = Ember.$('#directory-context-menu');
            ctxt.css({
                top: event.layerY+"px",
                left: event.layerX+"px",
                position: "absolute"
            });
            ctxt.removeClass("hidden");

            //Grab the selected row from the event object so we can
            //highlight it to show it's been selected.
            let selectedRow = event.path.find(offset => {
                return /contextmenu/.test(offset.classList.value);
            });
            this.set("selectedRow", Ember.$(selectedRow));
            this.selectedRow.css({background: "lightsteelblue"});

            //Save the item for when the user clicks on a menu action
            this.set("selectedItem", item);
        },

        closedContextMenu: function() {
            let ctxt = Ember.$('#directory-context-menu');
            ctxt.addClass('hidden');
            if(this.selectedRow) this.selectedRow.css({background: ""});
        },

        clickedContextMenuItem: function(menuItem) {
            let file = this.selectedItem;
            this.actions[menuItem].call(this, file);
        },

        updateModel(file) {
            let attrs = file.changedAttributes();
            let keys = Object.keys(attrs);
            let queryParams = keys.reduce((_q, key) => {
                let from = attrs[key][0];
                let to   = attrs[key][1];
                if(from === to) return _q;
                _q[key] = to;
                return _q;
            }, {});
            this.set('renaming', false);
            file.save({ adapterOptions: {queryParams: queryParams} });
        },

        move(file) {
            this.set('fileToMove', file);
            Ember.$('#move-file').removeClass('hidden');
        },

        moveFile() {
            Ember.$('#move-file').addClass('hidden');

            let queryParams = {folderId: this.moveTo};
            this.fileToMove.save({ adapterOptions: {queryParams: queryParams} });

            this.set('moveTo', '');
        },

        rename(file) {
            this.set('renaming', file.id);
        },

        copy(file) {
            console.log("copy "+file.get('name'));
        },

        download(file) {
            console.log("download "+file.get('name'));
        },

        remove(file) {
            this.set('fileToRemove', file);
            this.set("confirmValue", "");
            this.set("confirmDisabled", "disabled");

            let prompt = Ember.$('#confirm-remove');
            prompt.css({
                position:"absolute",
                top:event.layerY+"px",
                left:event.layerX+"px"
            });
            prompt.removeClass("hidden");
        },

        confirmedRemove() {
            Ember.$("#confirm-remove").addClass("hidden");
            this.fileToRemove.destroyRecord();
        },

        closedPrompt(prompt) {
            Ember.$(prompt).addClass("hidden");
        },

        confirmValueEquals(value) {
            if(this.confirmValue === value) {
                this.set('confirmDisabled', '');
            }
            else {
                this.set('confirmDisabled', 'disabled');
            }
        }
    }
});
