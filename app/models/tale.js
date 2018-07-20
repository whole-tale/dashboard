import DS from 'ember-data';

export default DS.Model.extend({
  "_accessLevel": DS.attr('number'),
  "_id": DS.attr('string'),
  "_modelType": DS.attr('string'),
  "authors":  DS.attr('string'),
  "category":  DS.attr('string'),
  "config": DS.attr(),
  "created": DS.attr('date'),
  "creatorId": DS.attr('string'),
  "description": DS.attr('string'),
  "icon": DS.attr('string'),
  "illustration": DS.attr('string'),
  "imageId": DS.attr('string'),
  "public": DS.attr('boolean'),
  "published": DS.attr('boolean'),
  "title": DS.attr('string'),
  "updated": DS.attr('date'),
  "involatileData": DS.attr(),
  "folderId": DS.attr('string')
});
