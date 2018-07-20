import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create({
    users: DS.attr(),
    groups: DS.attr()
});
