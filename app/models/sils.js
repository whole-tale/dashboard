import Ember from 'ember';
import DS from 'ember-data';

// Making Assumptions about the response data when calling GET /sils
export default DS.Model.extend({
    _id: DS.attr('string'),
    _modelType: DS.attr('string'),
    icon: DS.attr('string')
});