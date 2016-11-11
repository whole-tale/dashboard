import DS from 'ember-data';

export default DS.Model.extend({
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  _modelType: DS.attr('string'),
  created: DS.attr('date'),
  updated: DS.attr('date'),
  size: DS.attr('number'),
  name: DS.attr('string'),
  description: DS.attr('string'),
  public: DS.attr('boolean')
});
