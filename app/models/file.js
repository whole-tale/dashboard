import DS from 'ember-data';

export default DS.Model.extend({
  parentType: DS.attr(), // folder or item
  parentId: DS.attr(),
  name: DS.attr(),
  size: DS.attr(),
  mimeType: DS.attr(),
  linkUrl: DS.attr(),
  reference: DS.attr()
});
