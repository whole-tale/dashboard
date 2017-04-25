import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),
    showEditor : false,

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
            };

            let input = Ember.$('#txt-renaming');

            input.focus();

            input.on("blur", function() {
                if(timer) window.clearTimeout(timer);
                timer = window.setTimeout(cancelRenaming, 200);
            });
        }

    },

    actions: {
        clickedFolder : function(item) {
          if (window.event.ctrlKey) {
            this.send('openedContextMenu', item);
          } else {
            this.sendAction('action', item,  "true");
          }
        },

        clickedFile: function(item) {
            this.sendAction('action', item, "false");
        },

        closedMiniBrowser: function() {
             let mini = Ember.$('#mini-browser');
             mini.addClass('hidden');
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
            let mini = Ember.$('#mini-browser');

            mini.css({
                top: event.layerY+"px",
                left: event.layerX+"px",
                position: "absolute"
            });
            mini.removeClass('hidden');
        },

        moveFile(fileToMove, moveTo) {
            let self = this;

            Ember.$('#mini-browser').addClass('hidden');

            // let queryParams = {folderId: moveTo.get('id')};
            let queryParams = {};
            if(fileToMove.get("_modelType") === "folder") {
                queryParams['parentType'] = moveTo.get('_modelType');
                queryParams['parentId'] = moveTo.get('id');
            }
            else {
                queryParams['folderId'] = moveTo.get('id');
            }

            this.fileToMove.save({ adapterOptions: {queryParams: queryParams} })
                .then(_ => {
                    if(self.fileList) self.set('fileList', self.fileList.reject(item=>{return item.id === fileToMove.id;}));
                    if(self.folderList) self.set('folderList', self.folderList.reject(item=>{return item.id === fileToMove.id;}));
                });
        },

        rename(file) {
            this.set('renaming', file.id);
            this.set('selectedItem', file);
        },

        copy(file) {
            let self = this;
            let store = this.get('store');

            let fileType = file.get('_modelType');

            let copy = store.createRecord(fileType, {});
            copy.save({ adapterOptions: { copy: file.id } })
                .then(copy => {
                    if(fileType === "item") {
                        self.set('fileList', [copy].pushObjects(self.fileList.toArray()).sortBy('name'));
                    }
                    else if(fileType === "folder") {
                        self.set('folderList', [copy].pushObjects(self.folderList.toArray()).sortBy('name'));
                    }
                });
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
