import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import layout from './template';

export default Component.extend({
    classNames: ['folder-navigator'],
    folderNavs: service(),
    userAuth: service(),
    layout,

    init() {
        this._super(...arguments);
        this.set('navs', this.get('folderNavs').getFolderNavs());
        this.set('user', this.get('userAuth').getCurrentUser());
        next(this, function () {
            // code to be executed in the next run loop
            // to avoid modifying 'currentNav' in a single render
            this.forceNavClick();
        });
    },

    forceNavClick() {
        let currentCommand = this.get('currentNavCommand') || 'home';
        let currentNav = this.get('navs').filter(nav => nav.command === currentCommand)[0];
        this.actions.navClicked.call(this, currentNav);
    },

    actions: {
        navClicked(nav) {
            this.sendAction('navClicked', nav);
        },

        openCreateFolderModal() {
            this.sendAction('openCreateFolderModal');
        },

        openUploadDialog() {
            this.sendAction('openUploadDialog');
        },

        registerDataset() {
            this.sendAction('onRegisterDataset');
        }
    }
});
