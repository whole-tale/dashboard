import DS from 'ember-data';
  
export default DS.Model.extend({
    _id: DS.attr('string'),
    _modelType: DS.attr('string'), // group
    created: DS.attr('date'),
    updated: DS.attr('date'),
    description : DS.attr('string'),
    public: DS.attr('boolean'),
    name:    DS.attr('string')
});
  