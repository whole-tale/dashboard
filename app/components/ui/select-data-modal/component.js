import Component from '@ember/component';
import Object, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

const O = Object.create.bind(Object);

export default Component.extend({
    userAuth: service(),
    folderNavs: service(),
    store: service(),
    
    catalogTitle: 'WholeTale Catalog',
    catalogParentType: 'collection',
    catalogPath: '/collection/WholeTale Catalog/WholeTale Catalog',
    catalogId: '',
    catalogParentId: '',

    selectedMenuIndex: 0,
    dataSources: A([
        O({ name: 'WholeTale Catalog' }),
        //O({ name: 'My Data' })
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
            
            let text = this.get('catalogTitle');
            this.get('store').query('collection', { text }).then((results) => {
                let firstResult = results.firstObject;
                this.set('catalogParentType', firstResult['_modelType']);
                this.set('catalogParentId', firstResult['_id']);
                    
                // Only init after we've located the catalog
                this.initData.call(this);
            });
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
            this.addSelectedData.call(this, this.get('datasets'), this.get('files'), this.get('folders'));
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
        let selectedDS = this.get('selectedDataSource');
        let catalogTitle = this.get('catalogTitle');
        let parentId = selectedDS['name'] == catalogTitle ? this.get('catalogParentId') : this.get('userAuth').getCurrentUserID();
        let dataNavInfo = this.get('folderNavs').getFolderNavFor('user_data');
        let parentType = selectedDS['name'] == catalogTitle ? this.get('catalogParentType') : dataNavInfo.parentType;
        let adapterOptions = { queryParams: { limit: "0" } };

        const self = this;
        return store.query('dataset', { adapterOptions }).then(datasets => {
            let catalogId = parentId;
            let parentCollection = parentType;
            self.set('rootFolderId', catalogId);
            self.set('loading', false);
            self.set('datasets', A(datasets));
            self.set('folders', A([]));
            self.set('files', A([]));
            self.set('currentFolder', O({ id: catalogId, _modelType: 'folder', parentCollection, parentId }));

            //return self.loadFolder.call(self, catalogId, 'folder');
        }).catch(e => {
            self.set('loadError', true);
            self.set('loadingMessage', 'Failed to load registered data. Please try again');
        });
    },

    dblClick(target) {
        // HACK: Standard endpoints use "_modelType", /dataset uses "modelType"
        if (!target._modelType && target.modelType) {
            target._modelType = target.modelType;
        }
        
        if (!target || !target._modelType || (target._modelType !== 'folder' && target._modelType !== 'dataset')) {
            throw new Error('[select-data-modal] Cannot open. Not a folder or dataset.');
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

    goBack(currentFolder, adapterOptions = { queryParams: { limit: "0" } }) {
        this.set('loading', true);
        this.set('loadError', false);
        this.set('loadingMessage', 'Preparing Files');

        const store = this.get('store');

        let parentId = currentFolder.parentId;
        let parentType = currentFolder.parentCollection;

        const self = this;
        if (parentId == null || parentId == this.get('rootFolderId')) {
            return store.query('dataset', adapterOptions).then(datasets => {
                let catalogId = this.get('rootFolderId');
                self.set('loading', false);
                self.set('currentFolder', O({ id: catalogId, _modelType: 'folder', parentType, catalogId }));
                self.set('datasets', A(datasets));
                self.set('folders', A([]));
                self.set('files', A([]));
            });
        } else {
            return store.find('folder', parentId).then(parent => {
                self.set('currentFolder', parent);
                return self.loadFolder.call(self, parentId, parentType);
            }).catch(e => {
                self.set('loadError', true);
                self.set('loadingMessage', 'Failed to load registered data. Please try again');
            });
        }
    },

    loadFolder(parentId, parentType, adapterOptions = { queryParams: { limit: "0" } }) {
        this.set('loading', true);
        this.set('loadError', false);
        this.set('loadingMessage', 'Preparing Files');

        const store = this.get('store');
        let fetchFolders = store.query('folder', { parentId, parentType, adapterOptions });
        let fetchFiles = store.query('item', { folderId: parentId, adapterOptions });

        const self = this;
        return Promise.all([fetchFolders, fetchFiles]).then(([folders, files]) => {
            self.set('datasets', A([]));
            self.set('folders', A(folders));
            self.set('files', A(files));
            self.set('loading', false);
        });
    },

    addSelectedData(datasets, files, folders) {
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
        datasets.forEach(add);
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
