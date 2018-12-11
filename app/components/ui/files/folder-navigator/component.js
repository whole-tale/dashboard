import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
    classNames: ['folder-navigator'],
    folderNavs: service(),
    userAuth: service(),
    layout,

    init() {
        this._super(...arguments);
        this.set("navs", this.get('folderNavs').getFolderNavs());
        this.set("user", this.get('userAuth').getCurrentUser());
    },
    actions: {
        //--------------------------------------------
        navClicked(nav) {
            this.sendAction('navClicked', nav);
        },

        //--------------------------------------------
        openCreateFolderModal() {
            this.sendAction('openCreateFolderModal');
        },

        //--------------------------------------------
        openUploadDialog() {
            this.sendAction('openUploadDialog');
        },

        //--------------------------------------------
        registerDataset() {
            this.sendAction('onRegisterDataset');
        }
    }
});
