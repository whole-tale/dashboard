import DS from 'ember-data';

export default DS.Model.extend({
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  baseParentType: DS.attr('string'), // folder or item
  baseParentId: (this.get('baseParentType') === "collection")? DS.belongsTo('collection') : DS.belongsTo('folder'),
  name : DS.attr('string'),
  description: DS.attr('string'),
  created: DS.attr('date'),
  creatorId: DS.belongsTo('user'),
  public: DS.attr('boolean'),
  meta : DS.attr(), // this contains a creator object that contains a list of creators..
  parentCollection: DS.attr('string'), // folder or item
  parentId: (this.get('parentCollection') === "collection")? DS.belongsTo('collection') : DS.belongsTo('folder'),
  size: DS.attr('number'),
  updated: DS.attr('date'),
});

