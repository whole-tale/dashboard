import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  queryParams: {auth: false},
  internalState: service(),
  apiCall: service('api-call'),
  model(params) {
    this._super(...arguments);
    this.get('internalState').set('currentInstanceId', params.tale_id);
    //this.set('queryParams', params);
    return this.apiCall.fetchTaleData(params.tale_id);
  },
  actions: {
    error(error, transition) {
      // The docs led me to believe that the 'error' object would have a different format...
      // See https://guides.emberjs.com/v3.1.0/routing/loading-and-error-substates/#toc_the-error-event
      for (let err of error.errors) {
        
        // If we hit a 400 during transition, it is likely that 
        // currentInstanceId is no longer valid.. Redirect to /browse instead
        if (err.status === '400') {
          this.replaceWith('browse');
          return true;
        }
      }
    }
  }
});
