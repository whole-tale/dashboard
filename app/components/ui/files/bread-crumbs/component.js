import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import layout from './template';

const taleStatus = Object.create({
  NONE: -1,
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
  SITE_ADMIN: 100
});

export default Component.extend({
  layout,
  classNames: ['breadcrumbs-container'],
  internalState: service(),
  displayFoldersMenu: false,
  
  // Flag that can be used to tell if the current user has permission to edit the Tale
  canEditTale: computed('model._accessLevel', function () {
        return this.get('model') && this.get('model') && this.get('model').get('_accessLevel') >= taleStatus.WRITE;
  }).readOnly(),
  cannotEditTale: computed.not('canEditTale').readOnly(),

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
        if(this.get('cannotEditTale') && this.get('currentNav').command !== 'home') { return; }
        if(currentNavName === 'Data') {
            this.get('openSelectDataModal')();
        } else {
            this.set('displayFoldersMenu', !this.get('displayFoldersMenu'));
        }
    }
  }
});
