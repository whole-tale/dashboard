import Ember from 'ember';
import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
    userAuth: Ember.inject.service(),

    model() {
        let currentUserId = this.get('userAuth').getCurrentUserID();

        let catalogItems = {
            mine: Ember.A(),
            used: Ember.A(),
            all:  Ember.A()
        };

        return this.get('store').query('dataset', {})
            .then(registered => {
                catalogItems.all = registered;
                catalogItems.mine = registered.filter(each=>each.get('creatorId')===currentUserId);
                catalogItems.used = catalogItems.mine.filter(each=>each.get('parentCollection')!=="user");
                return catalogItems;
            })
            .catch(e => {
                console.log(e);
            });
    },

    // ---------------------------------------------------------------------
    setupController(controller, model) {
        this._super(controller, model);

        controller.set('catalogItems', model);
    }
});
