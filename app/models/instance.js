import DS from 'ember-data';

export default DS.Model.extend({
  _accessLevel: DS.attr('number'),
  _id: DS.attr('string'),
  _modelType: DS.attr('string'),
  containerInfo: DS.attr(),

  // contains
  //   "containerId": "397914f6bf9e4d153dd86e147b4fc872c67642ce54da3a58ae97dd8cd2b6d622",
  //   "containerPath": "user/hkhHpMloA4Pp/login?token=babf41833c9641a4a92bece48a34e5b7",
  //   "host": "172.17.0.1",
  //   "mountPoint": "/var/lib/docker/volumes/58caa69f9fcbde0001df4d26_ianjtaylor/_data",
  //   "volumeName": "58caa69f9fcbde0001df4d26_ianjtaylor",

  created: DS.attr('date'),
  creatorId: DS.attr('string'),
  lastActivity: DS.attr('string'),
  name: DS.attr('string'),
  sessionId: DS.attr('string'),
  status: DS.attr('number'),
  taleId: DS.attr('string'),
  url: DS.attr('string'),
  iframe: DS.attr('boolean')
});
