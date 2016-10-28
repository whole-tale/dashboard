import DS from 'ember-data';

export default DS.Model.extend({
  folderId: DS.attr(),
  name: DS.attr(),
  description: DS.attr(),
  reuseExisting: DS.attr('boolean')
});
