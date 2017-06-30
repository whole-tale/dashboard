import Ember from 'ember';

export default Ember.Controller.extend({
    catalogItems: {
        all:  Ember.A(),
        mine: Ember.A(),
        used: Ember.A()
    }
});
