import DS from 'ember-data';
import FolderItemMixin from 'wholetale/mixins/folder-item';

export default DS.Model.extend(FolderItemMixin, {
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  baseParentId: DS.attr('string'),
  baseParentType: DS.attr('string'),
  created: DS.attr('date'),
  creatorId: DS.attr('string'),
  folderId: DS.belongsTo('folder'),
  name: DS.attr('string'),
  size: DS.attr('number'),
  updated: DS.attr('date'),
  description: DS.attr('string'),
  reuseExisting: DS.attr('boolean')
});
