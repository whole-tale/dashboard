import Component from '@ember/component';


export default Component.extend({
  model: null,
  taleLaunchError: '',
  classNames: ['tale-tab-interact'],
  init() {
    this._super(...arguments);
  },
});