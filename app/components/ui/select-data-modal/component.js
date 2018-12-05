import Ember from 'ember';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default Ember.Component.extend({
  userAuth: service(),
  folderNavs: service(),
  store: service(),

  loading: true,

  model: Ember.Object.create({}),
  classNameBindings: ['injectedClassName'],

  injectedClassName: Ember.computed('modelType', 'model._modelType', 'model._id', function () {
    if(this.get('modelType')) {
        let newClass = `select-data-modal-${this.get('modelType')}`;
        return newClass;
    } else return '';
  }),

  actions: {
    loadData() {
      this.loadData.call(this);
    },

    updateSessionData() {
      console.log('Update session data');
      this.updateSessionData.call(this);
    },

    cancel() {
      console.log("cancelling session");
      this.cancel.call(this);
    },

    dblClick(target) {
      console.log(target);
      this.dblClick.call(this, target);
    }
  },

  loadData() {
    this.set('loading', true);

    const store = this.get('store');
    let folderId, parentId = this.get('userAuth').getCurrentUserID();
    let dataNavInfo = this.get('folderNavs').getFolderNavFor('user_data');
    let parentType = dataNavInfo.parentType;
    let name = dataNavInfo.name;
    let adapterOptions = {queryParams: {limit: "0"}};

    const self = this;
    return store.query('folder', {parentId, parentType, name, adapterOptions}).then(dataFolder => {
      parentId = folderId = dataFolder.content[0].id;
      parentType = 'folder';

      let fetchFolders = store.query('folder', {parentId, parentType, adapterOptions});
      let fetchFiles = store.query('item', {folderId});
  
      return Promise.all([fetchFolders, fetchFiles]);
    }).then(([folders, files]) => {
        self.set('folders', folders);
        self.set('files', files);
        self.set('loading', false);
    }).catch(e => {
      self.set('loading', false);
      console.error(e);
    });
  },

  dblClick(target) {
    if (!target || !target._modelType || target._modelType !== 'folder') {
      throw new Error('[select-data-modal] Cannot open folder.');
    }
  },
  updateSessionData() {
    throw new Error('[select-data-modal] "updateSessionData" must be provided!!');
  },
  cancel() {
    throw new Error('[select-data-modal] "cancel" function must be provided!!');
  }
});
