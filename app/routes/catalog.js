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

        let q = {adapterOptions:{registered: true}};
        return this.get('store').query('folder', q)
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

        Ember.run.schedule("afterRender", controller, function() {
            $('.menu .item')
                .tab()
            ;
            $('.list.item')
                .dimmer({
                    on: 'hover'
                })
            ;
        });
    }
});
