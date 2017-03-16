import DS from 'ember-data';

export default DS.Model.extend({
  "_accessLevel": DS.attr('number'),
  "_id": DS.attr('string'),
  "_modelType": DS.attr('string'),
  "baseParentId": DS.attr('string'),
  "baseParentType": DS.attr('string'),
  "created": DS.attr('date'),
  "creatorId": DS.attr('string'),
  "description": DS.attr('string'),
  "meta": DS.attr('string'),
  "name": DS.attr('string'),
  "parentCollection": DS.attr('string'),
  "parentId": DS.attr('string'),
  "public": DS.attr('bolean'),
  "size": DS.attr('number'),
  "updated": DS.attr('date')
});
