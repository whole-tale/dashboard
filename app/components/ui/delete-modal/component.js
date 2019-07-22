import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  model: EmberObject.create({}),
  classNameBindings: ['injectedClassName'],
  
  // Instance uses "name" everything else uses "title"
  name: computed('model.name', 'model.title', function() {
    return this.model.name || this.model.title;
  }),

  injectedClassName: computed('modelType', 'model._modelType', 'model._id', function () {
    if(this.get('modelType')) {
        let newClass = `delete-modal-${this.get('modelType')}`;
        return newClass;
    } else return '';
  }),

  actions: {
    approveDelete() {
      this.approveDelete(...arguments);
    },
    denyDelete() {
      this.denyDelete(...arguments);
    }
  },
  approveDelete() {
    throw new Error('approveDelete must be provided!!');
  },
  denyDelete() {
    throw new Error('denyDelete must be provided!!');
  }
});
