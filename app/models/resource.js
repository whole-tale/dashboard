import DS from 'ember-data';
import Ember from 'ember';
import FolderItemMixin from 'wholetale/mixins/folder-item';

export default DS.Model.extend({
  _access: DS.attr("string"),
  _id: DS.attr(),
  baseParentType: DS.attr('string'), // folder or item
  baseParentId: DS.attr('string'), // folder or item
  created: DS.attr('date'),
  creatorId: DS.belongsTo('user'),
  description: DS.attr('string'),
  lowerName: DS.attr('string'),
  name : DS.attr('string'),
  parentId: DS.attr('string'),
  parentCollection: DS.attr('string'), // folder or item
  public: DS.attr('boolean'),
  size: DS.attr('number'),
  updated: DS.attr('date')
});

