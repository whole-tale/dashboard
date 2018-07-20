import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['showChevron'],
  showChevron: true,

  actions: {
    selectedFolder(folder) {
      console.log(folder);
    }
  }

});