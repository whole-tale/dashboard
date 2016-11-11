import DS from 'ember-data';

export default DS.Model.extend({
  _id: DS.attr('string'),
  _modelType: DS.attr('string'), // folder or item
  admin: DS.attr('boolean'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  created: DS.attr('date'),
  login: DS.attr('string'),
  public: DS.attr('boolean'),
});
