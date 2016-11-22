import DS from 'ember-data';
import FolderItemMixin from 'wholetale/mixins/folder-item';

export default DS.Model.extend(FolderItemMixin, {
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  folderId: DS.belongsTo('folder'),
  name: DS.attr(),
  description: DS.attr(),
  reuseExisting: DS.attr('boolean')
});
