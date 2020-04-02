import Component from '@ember/component';
import config from '../../../../config/environment';
import layout from './template';
import { A } from '@ember/array';
import {
  inject as service
} from '@ember/service';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['directory-browser'],

  store: service(),
  internalState: service(),
  apiCall: service('api-call'),
  userAuth: service(),
  folderNavs: service(),

  apiUrl: config.apiUrl,
  refresh: null,

  showEditor: false,

  selectedItem: null,
  renaming: false,
  confirmDisabled: "disabled",

  didRender() {
    if (this.renaming) {
      var timer;

      let self = this;
      let cancelRenaming = function () {
        self.set("renaming", false);
        self.selectedItem.rollbackAttributes();
      };

      let input = $('#txt-renaming');

      input.focus();

      input.on("blur", function () {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(cancelRenaming, 200);
      });
    }

  },
    
  sortBy(array, field='name') {
    return array.sort(function(a, b) {
      const valA = a[field].toUpperCase(); // ignore case
      const valB = b[field].toUpperCase(); // ignore case
      return (valA < valB) ? -1 : ((valA > valB) ? 1 : 0);
    });
  },

  actions: {
    clickedFolder(item, event) {
      let evt = event || window.event;
      if (!evt.ctrlKey) {
        this.onItemClicked(item, "true");
      }
    },

    clickedFile(item) {
      this.onItemClicked(item, "false");
    },

    updateModel(file) {
      let attrs = file.changedAttributes();
      let keys = Object.keys(attrs);
      let queryParams = keys.reduce((_q, key) => {
        let from = attrs[key][0];
        let to = attrs[key][1];
        if (from === to) return _q;
        _q[key] = to;
        return _q;
      }, {});
      this.set('renaming', false);
      file.save({
        adapterOptions: {
          queryParams: queryParams
        }
      });
    },

    share(file) {
      const state = this.get('internalState');
      state.setACLObject(file);
      let modalElem = $('.acl-component');
      if (modalElem) {
        modalElem.modal('show');
        if (modalElem.hasClass("scrolling")) {
          modalElem.removeClass("scrolling");
        }
      }
    },

    move(file) {
      let command = this.get('currentNav').command;
      let disallowed = 'Data';
      if(command === 'user_data') {
        disallowed = 'Home';
      }
      this.set('disallowed', disallowed);
      this.set('fileToMove', file);
      $('.ui.modal.destinate-folder').modal('show');
    },

    moveFile(fileToMove, moveTo) {
      let self = this;

      // let queryParams = {folderId: moveTo.get('id')};
      let queryParams = {};
      if (fileToMove.get("_modelType") === "folder") {
        queryParams['parentType'] = moveTo.get('_modelType');
        queryParams['parentId'] = moveTo.get('id');
      } else {
        queryParams['folderId'] = moveTo.get('id');
      }

      this.fileToMove.save({
        adapterOptions: {
          queryParams: queryParams
        }
      }).then(() => {
        if (self.fileList) self.set('fileList', self.fileList.reject(item => {
          return item.id === fileToMove.id;
        }));
        if (self.folderList) self.set('folderList', self.folderList.reject(item => {
          return item.id === fileToMove.id;
        }));
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
      copy.save({
          adapterOptions: {
            copy: file.id
          }
        })
        .then(copy => {
          if (fileType === "item") {
            const files = self.fileList.toArray();
            files.push(copy);
            self.set('fileList', self.sortBy(files));
          } else if (fileType === "folder") {
            const folders = self.folderList.toArray();
            folders.push(copy);
            self.set('folderList', self.sortBy(folders));
          }
        });
    },

    copyToHome(item) {
      const self = this;
      self.set('loading', true);
      let parentId = this.get('userAuth').getCurrentUserID();
      let adapterOptions = { queryParams: { limit: "0" } };
      let parentType = 'user';
      let homeNavInfo = this.get('folderNavs').getFolderNavFor('home');
      let name = homeNavInfo.name;
      let copier = this;
      const store = this.get('store');
      return store.query('folder', { parentId, parentType, name, adapterOptions }).then(homeFolder => {
          self.set('loading', false);
          let homeFolderId = homeFolder.content[0].id;
          
          let apiCall = self.get('apiCall');
          let itemId = item.get('id');
          let resources = { item: [], folder: [] };
          if(item.get('isFolder')) {
            resources['folder'].push(itemId);
          } else {
            resources['item'].push(itemId);
          }
          let payload = JSON.stringify(resources);
          let success = self.get('showSuccessfulCopyNotification');
          let fail = self.get('showFailedCopyNotification');
          apiCall.copyToFolder(homeFolderId, 'folder', payload, false, success, fail, copier);
      }).catch(() => {
          self.set('loading', false);
          self.set('loadError', true);
          self.set('loadingMessage', 'Failed to load home folder content. Please try again');
      });
    },
    
    removeDataset(id) {
      const self = this;
      this.set('loading', true);
      this.set('loadError', false);
      this.get('store').findRecord('dataset', id, { backgroundReload: false }).then(dataset => {
        console.log("Dataset reference found... deleting:", dataset);
        dataset.destroyRecord().then(() => {
          self.set('loading', false);
          self.set('loadError', true);
        });
      }).catch((err) => {
        console.log("Error:", err);
        self.set('loading', false);
        self.set('loadError', true);
      });
    },

    remove(file) {
      const self = this;
      self.get('internalState').removeFolderFromRecentFolders(file.id);
      file.destroyRecord();
    },

    confirmedRemove() {
      $("#confirm-remove").addClass("hidden");
      let state = this.get('internalState');
      state.removeFolderFromRecentFolders(this.fileToRemove.id);
      this.fileToRemove.destroyRecord();
    },

    closedPrompt(prompt) {
      $(prompt).addClass("hidden");
    },

    confirmValueEquals(value) {
      if (this.confirmValue === value) {
        this.set('confirmDisabled', '');
      } else {
        this.set('confirmDisabled', 'disabled');
      }
    }
  }
});
