import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  image: DS.attr(),
  description: DS.attr(),
  date: DS.attr(),
  active: DS.attr(),
  likes: DS.attr()
});
