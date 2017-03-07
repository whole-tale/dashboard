import Ember from 'ember';
import layout from './template';


export default Ember.Component.extend({
    layout,
    menuItems: Ember.A(),
    didInsertElement() {
        let self = this;
        Ember.$(document).click(this.sendAction.bind(this, 'onClose'));
        Ember.$(document).keyup(function(evt) {
            if(evt.keyCode === 27) self.sendAction('onClose');
        });
    },
    actions: {
        close() {
            this.sendAction('onClose');
        },
        clicked(menuItem) {
            this.sendAction('onClick', menuItem);
        }
    }
});
