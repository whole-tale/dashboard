import Ember from 'ember';

export default Ember.Route.extend({
  tokenHandler: Ember.inject.service('token-handler'),
  userAuth: Ember.inject.service('user-auth'),
  currentUser : null,
  token : null,

  model: function(params) {
    console.log("In Authenticate Route");
    var token = this.get('tokenHandler').getWholeTaleAuthToken();

    console.log("Token is " + token);

    var router =this;

    if (( token == null) || (token === "")) {
      console.log("No token!!!");
      this.get("userAuth").resetCurrentUser();
      router.set('currentUser', null);
      router.transitionTo('login');
    }

    this.get('userAuth').getCurrentUserFromServer()
      .then(user => {
        if (user == null) {
          //   console.log("User is null");
          router.transitionTo('login');
          return null;
        } else {
          //   console.log("User is not null!!!");
          var userRec = router.get('store').createRecord('apiKey', {
            accessToken: token,
            user : user,
          });

          router.set('token', token);
          router.set('currentUser', user.getProperties('username', 'name', 'email'));

          alert('token = ' +  token + " and " + user.get('firstName') + " " + user.get('lastName'));
          return user;
        }
      });
  },
  events : {
    error : function(reason, transition) {
      if (reason.status === 401) {
        alert('You must be logged in');
        this. transitionToLogin('');
      } else {
        alert("Something went wrong");
      }
    }
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    // console.log("In auth router set controller method");
    if (model) {
      controller.set('loggedIn', true);
    }

    controller.set('user', model);
  }

});
