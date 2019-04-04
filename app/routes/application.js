import config from '../config/environment';
import {
  inject as service
} from '@ember/service';
import { setProperties, set } from '@ember/object';
import AuthenticateRoute from 'wholetale/routes/authenticate';
import $ from 'jquery';

export default AuthenticateRoute.extend({
  internalState: service(),
  model(params) {
    let router = this;
    return router._super(...arguments)
      .then(() => {
        let user = router.get('userAuth').getCurrentUser();
        return user;
      });
  },
  setupController: function (controller, model) {
    this._super(controller, model);

    if (model) {
      controller.set('loggedIn', true);
      controller.set('user', model);
      controller.set('gravatarUrl', config.apiUrl + "/user/" + model.get('_id') + "/gravatar?size=64");
      this.store.findAll('job', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }).then(jobs => {
        controller.set('jobs', jobs);
        controller.set('isLoadingJobs', false);
      });
    }
  },
  actions: {
    error(error, transition) {
      console.log('Error encountered during transition:', error);
      console.log('   Transition:', transition);
      return true;
    },
    toRoute() {
      this.transitionTo.call(this, ...arguments);
      return true;
    },

    closeModal() {
      const applicationController = this.controller;
  
      set(applicationController, 'isModalVisible', false);
    }

  }
});
