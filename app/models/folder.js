import DS from 'ember-data';

export default DS.Model.extend({
  parentType: DS.attr(), // folder or item
  parentId: DS.attr(),
  name: DS.attr(),
  description: DS.attr(),
  public: DS.attr('boolean') // true or false
});
