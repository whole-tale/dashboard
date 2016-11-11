import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  parentType: DS.attr('string'), // folder or item
  parentId: Ember.computed('parentType', function() {
      return (this.get('parentType') === "collection")? DS.belongsTo('collection') : DS.belongsTo('folder');
  }),
  name: DS.attr('string'),
  size: DS.attr('number'),
  mimeType: DS.attr('string'),
  linkUrl: DS.attr('string'),
  reference: DS.attr('string'),
  assetstoreId : DS.attr('string')
});
