import Component from '@ember/component';
import Object, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

const O = Object.create.bind(Object);

export default Component.extend({
    userAuth: service(),
    folderNavs: service(),
    store: service(),

    selectedMenuIndex: 0,
    dataSources: A([
        O({ name: 'WholeTale Catalog' }),
        O({ name: 'Tale Workspaces' })
    ]),
    selectedDataSource: O({}),

    allSelectedItems: A(),

    folders: A(),
    files: A(),

    loading: true,
    loadingMessage: 'Preparing Files',
    loadError: false,
    currentFolder: null,
    rootFolderId: null,

    model: O({}),
    classNameBindings: ['injectedClassName'],

    injectedClassName: computed('modelType', 'model.{_modelType,_id}', function () {
        if (this.get('modelType')) {
            let newClass = `select-data-modal-${this.get('modelType')}`;
            return newClass;
        } else return '';
    }),

    actions: {
        selectDatasource(datasource, index) {
            this.set('selectedDataSource', datasource);
            this.set('selectedMenuIndex', index);
        },

        initData() {
            this.selectedDataSource = this.get('dataSources')[this.get('selectedMenuIndex')];
            this.initData.call(this);
        },

        updateSessionData() {
            this.updateSessionData.call(this, this.get('allSelectedItems'));
        },

        cancel() {
            this.cancel.call(this);
        },

        dblClick(target) {
            this.dblClick.call(this, target);
        },

        onClick(target) {
            this.onClick.call(this, target);
        },

        goBack() {
            this.goBack.call(this, this.get('currentFolder'));
        },

        addSelectedData() {
            this.addSelectedData.call(this, this.get('files'), this.get('folders'));
        },

        removeSelectedData() {
            this.removeSelectedData.call(this);
        },

        close() {
          const deselect = f => {
            if (f.selected) {
              f.set('selected', false);
            }
          }
          this.allSelectedItems.forEach(deselect);
          this.set('folders', A());
          this.set('files', A());
          this.set('currentFolder', null);
          this.set('rootFolderId', null);
        }
    },

    // -----------------------------------------------------------------------
    // BELOW ARE FUNCTIONS FOR DEFAULT BEHAVIOR: 
    //    You can set custom behavior by overriding these functions. 
    // -----------------------------------------------------------------------

    initData() {
        this.set('loading', true);
        this.set('loadError', false);
        this.set('loadingMessage', 'Preparing Files');

        // this.set('allSelectedItems', A());
        this.set('folders', A());
        this.set('files', A());
        this.set('currentFolder', null);
        this.set('rootFolderId', null);

        const store = this.get('store');
        let parentId = this.get('userAuth').getCurrentUserID();
        let dataNavInfo = this.get('folderNavs').getFolderNavFor('user_data');
        let parentType = dataNavInfo.parentType;
        let name = dataNavInfo.name;
        let adapterOptions = { queryParams: { limit: "0" } };

        const self = this;
        return store.query('folder', { parentId, parentType, name, adapterOptions }).then(dataFolder => {
            let dataFolderId = dataFolder.content[0].id;
            let parentCollection = parentType;
            self.set('rootFolderId', dataFolderId);
            self.set('currentFolder', O({ id: dataFolderId, _modelType: 'folder', parentCollection, parentId }));

            return self.loadFolder.call(self, dataFolderId, 'folder');
        }).catch(e => {
            self.set('loadError', true);
            self.set('loadingMessage', 'Failed to load registered data. Please try again');
        });
    },

    dblClick(target) {
        if (!target || !target._modelType || target._modelType !== 'folder') {
            throw new Error('[select-data-modal] Cannot open. Not a folder.');
        }

        this.set('currentFolder', target);

        const self = this;
        return this.loadFolder.call(this, target.get('id'), target.get('_modelType')).catch(e => {
            self.set('loadError', true);
            self.set('loadingMessage', 'Failed to load registered data. Please try again');
        });
    },

    onClick(target) {
        let selected = !target.get('selected');
        target.set('selected', selected);
    },

    goBack(currentFolder) {
        this.set('loading', true);
        this.set('loadError', false);
        this.set('loadingMessage', 'Preparing Files');

        const store = this.get('store');

        let parentId = currentFolder.parentId;
        let parentType = currentFolder.parentCollection;

        const self = this;
        return store.find('folder', parentId).then(parent => {
            self.set('currentFolder', parent);
            return self.loadFolder.call(self, parentId, parentType);
        }).catch(e => {
            self.set('loadError', true);
            self.set('loadingMessage', 'Failed to load registered data. Please try again');
        });
    },

    loadFolder(parentId, parentType, adapterOptions = { queryParams: { limit: "0" } }) {
        this.set('loading', true);
        this.set('loadError', false);
        this.set('loadingMessage', 'Preparing Files');

        const store = this.get('store');
        let fetchFolders = store.query('folder', { parentId, parentType, adapterOptions });
        let fetchFiles = store.query('item', { folderId: parentId });

        const self = this;
        return Promise.all([fetchFolders, fetchFiles]).then(([folders, files]) => {
            self.set('folders', A(folders));
            self.set('files', A(files));
            self.set('loading', false);
        });
    },

    addSelectedData(files, folders) {
        const self = this;
        const add = f => {
          if (f.selected) {
            f.set('selected', false);
            let { id, name, _modelType } = f;
            if (!self.allSelectedItems.findBy('id', id)) {
                    self.allSelectedItems.pushObject(O({ id, name, _modelType }));
                }
            }
        }
        files.forEach(add);
        folders.forEach(add);
    },

    removeSelectedData() {
        const self = this;
        const del = f => {
            if (f.selected) {
                self.allSelectedItems.removeObject(f);
            }
        }
        let all = A(this.get('allSelectedItems').concat([]));
        all.forEach(del);
    },

    loadDataset(adapterOptions = { queryParams: { limit: "0" } }) {

    },

    loadTaleWorkspaces(adapterOptions = { queryParams: { limit: "0" } }) {

    },

    updateSessionData() {
        throw new Error('[select-data-modal] "updateSessionData" must be provided!!');
    },

    cancel() {
        
        // this.set('allSelectedItems', A());

        // NOTE(Adam): This causes an infinite loop where the function calls itself recursively forever.

        // if (this.get('cancel')) {
        //     this.get('cancel')();
        // } else {
        //     throw new Error('[select-data-modal] "cancel" function must be provided!!');
        // }
    }
});