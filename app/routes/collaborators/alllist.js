import Ember from 'ember';

export default Ember.Route.extend({
    model(params, transition) {
        let self = this;
        let userId = transition.params['collaborators.list'].user_id;

      alert("Triggered for user " + userId);

      return this.store.query('user', {id:userId})
            .catch(e => {
                // No such user?
            })
            .then(model => {
                //TODO: Grab Items as well
                return model;
            })
            .catch(e => {
                return Ember.A();
                //this means that a 400 was returned
            });
    }
});
