import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  _modelType: DS.attr('string'),
  created: DS.attr('date'),
  creatorId: DS.attr('string'),
  itemId: DS.belongsTo('item'),
  exts: DS.attr(),
  name: DS.attr('string'),
  size: DS.attr('number'),
  mimeType: DS.attr('string'),
  linkUrl: DS.attr('string'),
  reference: DS.attr('string'),
  assetstoreId : DS.attr('string')
});
