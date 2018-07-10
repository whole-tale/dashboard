import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,

  clearModal() {
  },

  init() {
    this._super(...arguments);
  },

  actions: {
    moveFile() {

    },

    cancel() {
      this.clearModal();
    }
  }
});