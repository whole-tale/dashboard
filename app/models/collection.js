import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  descrition: DS.attr(),
  public: DS.attr('boolean')
});
