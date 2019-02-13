import DS from 'ember-data';
import Ember from 'ember';
import FolderItemMixin from 'wholetale/mixins/folder-item';
import AccessControlMixin from 'wholetale/mixins/access-control';

export default DS.Model.extend(FolderItemMixin, AccessControlMixin, {
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  _modelType: DS.attr('string'),
  baseParentType: DS.attr('string'), // folder or item
  baseParentId: DS.attr('string'), // folder or item
  // baseParentId: Ember.computed('baseParentType', function() {
  //     return (this.get('baseParentType') === "collection") ? DS.belongsTo('collection') : DS.belongsTo('folder');
  // }),
  // parentType: DS.attr('string'),
  //items: DS.hasMany('item'),
  //folders: DS.hasMany('folder', { inverse: 'parent' }),
  //parent: DS.belongsTo('folder', { inverse: 'folders' }),
  name : DS.attr('string'),
  lowerName : DS.attr('string'),
  description: DS.attr('string'),
  created: DS.attr('date'),
  // parentId: Ember.computed('parentCollection', function() {
  //     return (this.get('parentCollection') === "collection")? DS.belongsTo('collection') : DS.belongsTo('folder');
  // }),
  creatorId: DS.attr('string'),
  public: DS.attr('boolean'),
  meta : DS.attr(), // this contains a creator object that contains a list of creators..
  parentId: DS.attr('string'),
  parentCollection: DS.attr('string'), // folder or item
  size: DS.attr('number'),
  updated: DS.attr('date')
});
