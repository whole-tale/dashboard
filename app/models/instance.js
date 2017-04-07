import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  containerId: DS.attr('string'),
  containerPath: DS.attr('string'),
  created: DS.attr('date'),
  folderId: DS.attr('string'),
  frontendId: DS.attr('string'),
  lastActivity: DS.attr('string'),
  mountPoint: DS.attr('string'),
  status: DS.attr('number'),
  userId: DS.attr('string'),
  when: DS.attr('date')
});

