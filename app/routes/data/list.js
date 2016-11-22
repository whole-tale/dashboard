import Ember from 'ember';

export default Ember.Route.extend({
    model(params, transition) {
        let self = this;
        let parentId = transition.params['data.list'].collection_id;

        return this.store.query('folder', {parentId:parentId, parentType:'folder'})
            .catch(e => {
                //this could mean that we're listing the wrong parent type so try collection next
                return self.store.query('folder',  {parentId:parentId, parentType:'collection'});
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
