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
    toRoute() {
      this.transitionTo.call(this, ...arguments);
      return true;
    },

    showModal(modalDialogName, modalContext) {
      if (modalContext.hasD1JWT) {
        const applicationController = this.controller;

        setProperties(applicationController, {
          modalDialogName,
          modalContext: modalContext.taleId,
          isModalVisible: true
        });
      }
      else {
        let selector = '.ui.dataone.modal';
        $(selector).modal('show');
      }
      // const applicationController = this.controller;

      // setProperties(applicationController, {
      //   modalDialogName,
      //   modalContext,
      //   isModalVisible: true
      // });
    },

    closeModal() {
      const applicationController = this.controller;
  
      set(applicationController, 'isModalVisible', false);
    }

  }
});
