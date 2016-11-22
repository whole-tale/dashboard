import Ember from 'ember';

export default Ember.Mixin.create({
    isItem: Ember.computed('_modelType', function() {
        return (this.get('_modelType') === "item");
    }),
    isFolder: Ember.computed('_modelType', function() {
        return (this.get('_modelType') === "folder");
    })
});
