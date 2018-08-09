import Ember from 'ember';
let inject = Ember.inject;

export default Ember.Controller.extend({

    closeWindow() {
        window.close();
    }

});
