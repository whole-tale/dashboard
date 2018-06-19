import Ember from 'ember';

export default Ember.Component.extend({
    model: Ember.Object.create({}),

    actions: {
        approveDelete: function() {
            console.log('deleting...');
            this.approveDelete(...arguments);
        },
        denyDelete: function() {
            // this.denyDelete(...arguments);
            console.log("cancelling deletion");
        }
    },
    approveDelete: function() {
        throw new Error('approveDelete must be provided!!');
    }
});