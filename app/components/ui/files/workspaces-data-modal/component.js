import Component from '@ember/component';
import Object, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

const O = Object.create.bind(Object);

export default Component.extend({
    userAuth: service(),
    folderNavs: service(),
    store: service(),
    internalState: service(),

    selectedMenuIndex: 0,
    dataSources: A([
        //O({ name: 'Home', description: 'Global directory accessible across all Tales' }),
        O({ name: 'Tale Workspaces', description: 'Other accessible Tales' })
    ]),
    selectedDataSource: O({}),

    canSubmit: computed('rootFolderId', 'currentFolder', function() {
        let rootFolderId = this.rootFolderId;
        let currentFolder = this.currentFolder;
        let currentFolderId = currentFolder != null ? currentFolder.get('id') : null; 
        return rootFolderId == currentFolderId;
    }),
    
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

    init() {
        this._super(...arguments);
        this.set('selectedDataSource', this.get('dataSources')[this.get('selectedMenuIndex')]);
    },

    actions: {
        selectDatasource(datasource, index) {
            this.set('selectedDataSource', datasource);
            this.set('selectedMenuIndex', index);
            this.initData.call(this);
        },

        initData() {
            this.selectedDataSource = this.get('dataSources')[this.get('selectedMenuIndex')];
            this.initData.call(this);
        },

        updateWorkspaceData(permanently) {
            this.actions.addSelectedData.call(this);
            this.updateWorkspaceData.call(this, this.get('allSelectedItems'), permanently);
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

        this.set('allSelectedItems', A());
        this.set('folders', A());
        this.set('files', A());
        this.set('currentFolder', null);
        this.set('rootFolderId', null);

        let selectedDataSource = this.get('selectedDataSource');
        if(selectedDataSource.name === 'Home') {
            this.loadHomeFolder.call(this);
        } else {
            this.loadTaleWorkspaces.call(this);
        }
    },

    dblClick(target) {
        if (!target || !target._modelType || target._modelType !== 'folder') {
            // Only allow the user to double-click folders
            //throw new Error('[select-data-modal] Cannot open. Not a folder.');
            return;
        }
        
        this.set('currentFolder', target);
        this.get('openFolder')(target, this);
    },

    onClick(target) {
        if (this.get('rootFolderId') == this.get('currentFolder').get('id')) {
            // Only allow the user to select files and folders (not an entire Workspace)
            //throw new Error('[select-data-modal] Cannot select. Not a folder or item.');
            this.set('currentFolder', target);
            this.get('openFolder')(target, this);
        } else {
            let selected = !target.get('selected');
            target.set('selected', selected);
        }
    },
    
    openFolder(target, self = this) {
        let parentCollection = 'folder';
        let parentId = target.get('id');

        return self.loadFolder.call(self, parentId, parentCollection).catch(e => {
            self.set('loadError', true);
            self.set('loadingMessage', 'Failed to load registered data. Please try again');
        });
    },

    goBack(currentFolder, adapterOptions = { queryParams: { limit: "0" } }) {
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

        const workspaceRootId = this.get('internalState').workspaceRootId;
        const store = this.get('store');
        const self = this;
        
        if (parentId == workspaceRootId) {
            return store.query('workspace', {
                adapterOptions
            }).then((workspaces) => {
                // Should be safe to assume that all workspaces are folders
                self.set('folders', A(workspaces));
                self.set('files', A([]));
                self.set('loading', false);
            })
        } else {
            let fetchFolders = store.query('folder', {
                parentId,
                parentType,
                adapterOptions
            });
            let fetchFiles = store.query('item', {
                folderId: parentId
            });
            return Promise.all([fetchFolders, fetchFiles]).then(([folders, files]) => {
                // Folder and files can be returned, separate them accordingly
                self.set('folders', A(folders));
                self.set('files', A(files));
                self.set('loading', false);
            });
        }
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

    loadHomeFolder(adapterOptions = { queryParams: { limit: "0" } }) {
        const self = this;
        self.set('loading', true);
        let parentId = this.get('userAuth').getCurrentUserID();
        let parentType = 'user';
        let homeNavInfo = this.get('folderNavs').getFolderNavFor('home');
        let name = homeNavInfo.name;

        const store = this.get('store');
        return store.query('folder', { parentId, parentType, name, adapterOptions }).then(homeFolder => {
            self.set('loading', false);
            let homeFolderId = homeFolder.content[0].id;
            let parentCollection = parentType;
            self.set('rootFolderId', homeFolderId);
            self.set('currentFolder', O({ id: homeFolderId, _modelType: 'folder', parentCollection, parentId }));

            return self.loadFolder.call(self, homeFolderId, 'folder');
        }).catch(e => {
            self.set('loading', false);
            self.set('loadError', true);
            self.set('loadingMessage', 'Failed to load home folder content. Please try again');
        });
    },

    loadTaleWorkspaces() {
        const self = this;
        
        let parentId = self.get('userAuth').getCurrentUserID();
        let parentCollection = 'folder';
        let workspaceRootId = this.get('internalState').workspaceRootId;
        this.set('rootFolderId', workspaceRootId);
        this.set('currentFolder', O({ id: workspaceRootId, _modelType: 'folder', parentCollection, parentId }));

        return self.loadFolder(workspaceRootId, parentCollection);
    },

    updateWorkspaceData() {
        throw new Error('[workspace-data-modal] "updateWorkspaceData" must be provided!!');
    },

    cancel() {
        if (this.get('cancel')) {
            this.get('cancel')();
        } else {
            throw new Error('[workspace-data-modal] "cancel" function must be provided!!');
        }
    }
});
