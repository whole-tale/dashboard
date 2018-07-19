import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),
    internalState: Ember.inject.service(),

    cold: null,
    view : null,
    title: null,

    didRender() {
    },

    actions: {
        dummy(value) {
        }
    }
});
