import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Route.extend({
  tokenHandler: Ember.inject.service('token-handler'),
  userAuth: Ember.inject.service('user-auth'),
  routerService: service('-routing'),
  currentUser: null,
  token: null,

  model: function (params) {
    // console.log("In Authenticate Route");
    var token = this.get('tokenHandler').getWholeTaleAuthToken();

    // console.log("Token is " + token);

    var router = this;

    if ((token === null) || (token === "")) {
      //   console.log("No token!!!");
      this.get("userAuth").resetCurrentUser();
      router.set('currentUser', null);
      router.transitionTo('login');
    }

    return this.get('userAuth').getCurrentUserFromServer()
      .then(user => {
        if (user === null) {
          // console.log("User is null");
          this.get("tokenHandler").releaseWholeTaleCookie();
          this.get("userAuth").resetCurrentUser();
          router.set('currentUser', null);
          let returnRoute = this.routerService.router.url;
          
          // Prevent nesting of multiple "rd" parameters, and prevent redirecting to login after login
          if (returnRoute.indexOf("?rd=") !== -1 || returnRoute.indexOf("login") !== -1) {
            router.transitionTo('login');
          } else {
            router.transitionTo('login', { queryParams: { rd: encodeURIComponent(returnRoute) }});
          }
          return null;
        } else {
          //   console.log("User is not null!!!");
          var userRec = router.get('store').createRecord('apiKey', {
            accessToken: token,
            user: user,
          });

          router.set('token', token);
          router.set('currentUser', user.getProperties('username', 'name', 'email'));

          //  alert('token = ' +  token + " and " + user.get('firstName') + " " + user.get('lastName'));
          return user;
        }
      });
  },
  events: {
    error: function (reason, transition) {
      if (reason.status === 401) {
        alert('You must be logged in');
        this.transitionToLogin('');
      } else {
        alert("Something went wrong");
      }
    }
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    // console.log("In auth router set controller method");
    if (model) {
      controller.set('loggedIn', true);
    }

    controller.set('user', model);
  }

});
