import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  command: DS.attr('string'),
  cpuShares: DS.attr('string'),
  created: DS.attr('date'),
  description: DS.attr('string'),
  imageName: DS.attr('string'),
  memLimit: DS.attr('string'), // e.g. "1024m",
  port: DS.attr('number'),
  public: DS.attr('boolean'),
  updated: DS.attr('date'),
  user: DS.attr('string')
});
