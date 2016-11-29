import DS from 'ember-data';
import Ember from 'ember';
import FolderItemMixin from 'wholetale/mixins/folder-item';

export default DS.Model.extend(FolderItemMixin, {
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  _modelType: DS.attr('string'),
  baseParentType: DS.attr('string'), // folder or item
  baseParentId: Ember.computed('baseParentType', function() {
      return (this.get('baseParentType') === "collection") ? DS.belongsTo('collection') : DS.belongsTo('folder');
  }),
  items: DS.hasMany('item'),
  folders: DS.hasMany('folder'),
  name : DS.attr('string'),
  description: DS.attr('string'),
  created: DS.attr('date'),
  parentId: Ember.computed('parentCollection', function() {
      return (this.get('parentCollection') === "collection")? DS.belongsTo('collection') : DS.belongsTo('folder');
  }),
  creatorId: DS.belongsTo('user'),
  public: DS.attr('boolean'),
  meta : DS.attr(), // this contains a creator object that contains a list of creators..
  parentCollection: DS.attr('string'), // folder or item
  size: DS.attr('number'),
  updated: DS.attr('date')
});
