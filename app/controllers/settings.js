import Controller from '@ember/controller';
import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { sort } from '@ember/object/computed';
import config from '../config/environment';

import $ from 'jquery';

const O = EmberObject.create.bind(EmberObject);

export default Controller.extend({
    userAuth: service(),
    store: service(),
    apiCall: service(),
    
    defaultErrorMessage: "There was an error while storing your API key.",
    model: null,
    newApiKey: '',
    newResourceServer: '',
    generateKeyUrl: '',
    
    providers: A([]),
    providerTargets: O({}),
    
    sortByName: Object.freeze(['name']),
    sortedProviders: sort('providers', 'sortByName'),
    
    user: O({}),
    tokens: O({}),
    
    init() {
      this._super(...arguments);
      this.refreshProviders();
    },
    
    refreshProviders() {
      const component = this;
      
      // Fetch external account providers
      const adapterOptions = { queryParams: { redirect: config.wholeTaleHost + '/settings' } };
      component.store.query('account', { adapterOptions }).then(providers => {
        // Of course Ember has their own array implementation... -_-*
        component.set('providers', A(providers));
        component.refreshUserTokens();
      }, err => console.error("Failed to fetch external account providers:", err));
    },
    
    fetchDataOneJwt(user, provider) {
      const component = this;
      let xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", provider.url, false);
        
      // Let XMLHttpRequest know to use cookies
      xmlHttp.withCredentials = true;
      xmlHttp.setRequestHeader("Content-Type", "text/xml");
      xmlHttp.send(null);
      
      // If we get a response, POST it back to Girder as an API key
      const jwt = xmlHttp.responseText;
      if (jwt) {
        const token = user.otherTokens.find(t => t.provider === provider.name);
        component.actions.connectProvider.call(component, provider, token.resource_server, jwt, 'dataone');
      }
    },
    
    refreshUserTokens() {
      const component = this;
      
      // Fetch user's configured external tokens
      component.get('userAuth').getCurrentUserFromServer().then(user => {
        component.set('user', user);
        
        component.get('providers').forEach(provider => {
          if (provider.type === 'dataone' && provider.state === 'preauthorized') {
            // If any DataONE providers are in a preauthorized state
            // fetch the DataONE JWT and POST it back to Girder
            component.fetchDataOneJwt(user, provider);
          } else if (provider.type === 'apikey') {
            // Pre-fetch all apikey provider targets
            component.apiCall.getExtAccountTargets(provider.name).then(targets => {
              component.get('providerTargets').set(provider.name, targets);
              provider.set('targets', targets);
            }, err => console.error("Failed to fetch provider targets:", err));
          }
        });
      });
    },

    handleError(e) {
      const self = this;
      if (e.message) {
        self.set('errorMessage', e.message);
      } else {
        let msg = (e.responseJSON ? e.responseJSON.message : self.get('defaultErrorMesage'));
        self.set('errorMessage', msg);
      }
      $('.ui.modal.apikey-error').modal('show');
      $('.ui.modal.apikey-error').modal({
        onHide: function(element) {
          self.set('errorMessage', '');
          return true;
        },
      });
    },
    
    actions: {
      setGenerateKeyUrl(selected) {
        const self = this;
        const resourceServer = selected.target.value;
        if (resourceServer) {
          let provider = self.get('selectedProvider');
          let url = new URL(provider.docs_href)
          url.hostname = resourceServer;
          self.set('generateKeyUrl', url.toString());
        } else {
          self.set('generateKeyUrl', '');
        }
      },
      
      connectOAuthProvider(provider) {
        window.location.href = provider.url;
      },
      
      showConnectExtAcctModal(provider) {
        const component = this;
        component.set('selectedProvider', provider);
        //const targets = component.get('providerTargets').get(provider.name);
        //component.get('selectedProvider').set('targets', targets);
        
        // Pop up a modal for choosing resource_server and entering a new API key
        $('#connect-apikey-modal').modal('show');
        $('#newResourceServerDropdown').dropdown();
      },
      
      clearConnectExtAcctModal() {
        const component = this;
        
        // Reset modal state
        $('#newResourceServerDropdown').dropdown('clear');
        component.set('newApiKey', '');
        component.set('newResourceServer', '');
        component.set('generateKeyUrl', '');
      },
      
      connectProvider(provider, newResourceServer, newApiKey, keyType = 'apikey') {
        const component = this;
        console.log("Connect confirmed:", provider);
        
        // POST back to /account/:provider/key
        component.apiCall.authExtToken(provider.name, newResourceServer, newApiKey, keyType)
          .catch(err => component.handleError(err))
          .finally(() => {
            // Refresh view
            component.refreshProviders();
          
            // Close modal and reset state
            component.actions.clearConnectExtAcctModal.call(component);
          });
      },
      
      showConfirmDeleteModal(provider, token) {
        const component = this;
        component.set('selectedProvider', provider);
        component.set('selectedToken', token);
        
        // TODO: pop up a modal for confirming deletion
        $('#revoke-apikey-modal').modal('show');
      },
      
      confirmRevokeToken(token) {
        const component = this;
        console.log("Disconnect confirmed:", token);
        
        // GET from /account/:provider/revoke
        const fakeRedirect = encodeURIComponent('https://dashboard.local.wholetale.org/settings');
        component.apiCall.revokeExtToken(token, fakeRedirect, token.resource_server).then(resp => {
          component.refreshProviders();
        }, err => {
          console.error("Failed to revoke external token:", err);
          
          // FIXME: Server returns an error when attempting to redirect... silly.
          component.refreshProviders();
        });
        
      },
    }
});
