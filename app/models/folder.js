import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  // _isParentFolder: DS.attr('boolean'),
  // _isParentCollection: DS.attr('boolean'),
  baseParentType: DS.attr('string'), // folder or item
  baseParentId: Ember.computed('baseParentType', function() {
      return (this.get('baseParentType') === "collection") ? DS.belongsTo('collection') : DS.belongsTo('folder');
  }),
  name : DS.attr('string'),
  description: DS.attr('string'),
  created: DS.attr('date'),
  creatorId: DS.belongsTo('user'),
  public: DS.attr('boolean'),
  meta : DS.attr(), // this contains a creator object that contains a list of creators..
  parentCollection: DS.attr('string'), // folder or item
  parentId: Ember.computed('parentCollection', function() {
      return (this.get('parentCollection') === "collection")? DS.belongsTo('collection') : DS.belongsTo('folder');
  }),
  size: DS.attr('number'),
  updated: DS.attr('date'),
});
