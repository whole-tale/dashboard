import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  _accessLevel: DS.attr('number'),
  config: DS.attr(),
  created: DS.attr('date'),
  creatorId: DS.attr('string'),
  description: DS.attr('string'),
  digest: DS.attr('string'),
  fullName: DS.attr('string'),
  icon: DS.attr('string'),
  name: DS.attr('string'),
  parentId: DS.attr('string'),
  public: DS.attr('boolean'),
  recipeId: DS.attr('string'),
  status: DS.attr('number'),
  tags: DS.attr('string'),
  updated: DS.attr('date')
});
