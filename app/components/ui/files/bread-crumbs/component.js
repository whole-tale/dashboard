import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  layout,
  classNames: ['breadcrumbs-container'],
  internalState: service(),

  actions: {
    breadcrumbClicked(item) {
      this.sendAction('bcClicked', item);

    },

    navClicked(nav) {
      this.sendAction('navClicked', nav);
    }
  }
});
