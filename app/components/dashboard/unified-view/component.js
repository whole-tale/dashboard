import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),
    internalState: Ember.inject.service(),

    leftTitle: null,
    leftView: null,
    leftPanelColor: null,

    rightTitle: null,
    rightView: null,
    rightPanelColor: null,

    didRender() {
    },

    actions: {
        dummy(value) {
        }
    }
});
