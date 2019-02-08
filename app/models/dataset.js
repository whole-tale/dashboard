import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  created: DS.attr('date'),
  creatorId: DS.attr('string'),
  description: DS.attr('string'),
  identifier: DS.attr('string'),
  name: DS.attr('string'),
  provider: DS.attr('string'),
  size: DS.attr('number'),
  updated: DS.attr('date'),
});
