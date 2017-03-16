import DS from 'ember-data';

export default DS.Model.extend({
  "_accessLevel": DS.attr('number'),
  "_id": DS.attr('string'),
  "_modelType": DS.attr('string'),
  "config": DS.attr('string'),
  "created": DS.attr('date'),
  "creatorId": DS.attr('string'),
  "description": DS.attr('string'),
  "folderId": DS.attr('string'),
  "imageId": DS.attr('string'),
  "name": DS.attr('string'),
  "public": DS.attr('boolean'),
  "published": DS.attr('boolean'),
  "updated": DS.attr('date'),
});
