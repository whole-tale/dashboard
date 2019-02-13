import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  layout,
  classNames: ['breadcrumbs-container'],
  internalState: service(),
  displayFoldersMenu: false,

  actions: {
    breadcrumbClicked(item) {
      this.sendAction('bcClicked', item);

    },

    navClicked(nav) {
      this.sendAction('navClicked', nav);
    },

    openCreateFolderModal() {
        this.sendAction('openCreateFolderModal');
    },

    openUploadDialog() {
        this.sendAction('openUploadDialog');
    },
    openSelectDataModal() {
        this.get('openSelectDataModal')();
    },
    openWorkspacesDataModal() {
        this.get('openWorkspacesDataModal')();
    },

    triggerBreadcrumbAction(currentNavName) {
        if(currentNavName === 'Data') {
            this.get('openSelectDataModal')();
        } else {
            this.set('displayFoldersMenu', !this.get('displayFoldersMenu'));
        }
    }
  }
});
