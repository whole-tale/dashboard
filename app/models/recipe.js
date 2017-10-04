import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  commitId: DS.attr(),
  created: DS.attr('date'),
  creatorId: DS.attr('string'),
  description: DS.attr('string'),
  name: DS.attr('string'),
  parentId: DS.attr('string'),
  public: DS.attr('boolean'),
  tags: DS.attr('string'),
  updated: DS.attr('date'),
  url: DS.attr('string')
});
