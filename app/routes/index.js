import Ember from 'ember';


import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  userAuth: Ember.inject.service(),

  model() {
    let currentUserId = this.get('userAuth').getCurrentUserID();

    let catalogItems = {
      mine: Ember.A(),
      used: Ember.A(),
      all: Ember.A()
    };

    let route = this;

    return this.get('store').query('dataset', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      })
      .then(registered => {
        registered.forEach(function (model) {
          var creatorId = model.get('creatorId');
          var userName = "System";
          if (creatorId != null) {
            return route.get('store').findRecord("user", creatorId)
              .then(user => {
                if (user != null) {
                  userName = [user.get('firstName'), user.get('lastName')].join(" ");
                }
                model.set("creator", userName);
              });
          }

          model.set("creator", userName);
        });

        catalogItems.all = registered;
        catalogItems.mine = registered.filter(each => each.get('creatorId') === currentUserId);
        catalogItems.used = catalogItems.mine.filter(each => each.get('parentCollection') !== "user");

        return {
          images: this.get('store').findAll('image', {
            reload: true,
            adapterOptions: {
              queryParams: {
                limit: "0"
              }
            }
          }),
          tales: this.get('store').findAll('tale', {
            reload: true,
            adapterOptions: {
              queryParams: {
                sort: "created",
                sortdir: "1",
                limit: "0"
              }
            }
          }),
          dataRegistered: this.get('store').query('folder', {
            reload: true,
            adapterOptions: {
              appendPath: "registered",
              queryParams: {
                limit: "0"
              }
            }
          }),
          catalogItems: catalogItems
        };
      })
      .catch(e => {
        console.log(e);
      });
  }
});
