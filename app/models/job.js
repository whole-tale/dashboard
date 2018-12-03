import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  created: DS.attr('date'),
  interval: DS.attr('number'),
  log: DS.attr('string'),
  parentId: DS.attr('string'),
  progress: DS.attr(),
  public: DS.attr('boolean'),
  status: DS.attr('number'),
  timestamps: DS.attr(),
  title: DS.attr('string'),
  type: DS.attr('string'),
  updated: DS.attr('date')
});
