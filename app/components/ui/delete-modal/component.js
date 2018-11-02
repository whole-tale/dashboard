import Ember from 'ember';

export default Ember.Component.extend({
  model: Ember.Object.create({}),
  classNameBindings: ['injectedClassName'],

  injectedClassName: Ember.computed('modelType', 'model._modelType', 'model._id', function () {
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
