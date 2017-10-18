import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'), // folder or item
  admin: DS.attr('boolean'),
  created: DS.attr('date'),
  email: DS.attr('string'),
  emailVerified: DS.attr('boolean'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  groupInvites : DS.attr('string'),
  groups : DS.attr('string'),
  login: DS.attr('string'),
  public: DS.attr('boolean'),
  size : DS.attr('number'),
  status : DS.attr('string'),
  name:    DS.attr('string')
});
