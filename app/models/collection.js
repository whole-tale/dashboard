import DS from 'ember-data';

export default DS.Model.extend({
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  _modelType: DS.attr(),
  created: DS.attr('date'),
  updated: DS.attr('date'),
  size: DS.attr('number'),
  name: DS.attr(),
  description: DS.attr(),
  public: DS.attr('boolean')
});
