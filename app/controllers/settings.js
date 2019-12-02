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
    
    model: null,
    newApiKey: '',
    newResourceServer: '',
    
    providers: A([]),
    providerTargets: A([]),
    
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
      const adapterOptions = { queryParams: { redirect: 'https://dashboard.local.wholetale.org/settings' } };
      component.store.query('account', { adapterOptions }).then(providers => {
        // Of course Ember has their own array implementation... -_-*
        component.set('providers', A(providers));
        component.refreshUserTokens();
      }, err => console.error("Failed to fetch external account providers:", err));
    },
    
    refreshUserTokens() {
      const component = this;
      
      // Fetch user's configured external tokens
      component.get('userAuth').getCurrentUserFromServer().then(user => {
        component.set('user', user);
        
        component.get('providers').forEach(provider => {
          if (provider.type === 'dataone' && provider.state === 'preauthorized') {
            let xmlHttp = new XMLHttpRequest();
        
            xmlHttp.open("GET", provider.url, false);
            // Set the response content type
            xmlHttp.setRequestHeader("Content-Type", "text/xml");
            // Let XMLHttpRequest know to use cookies
            xmlHttp.withCredentials = true;
            xmlHttp.send(null);
            
            const data =  xmlHttp.responseText;
            if (data) {
              const token = user.otherTokens.find(t => t.provider === provider.name);
              component.apiCall.authExtToken(provider.name, token.resource_server, data, 'dataone').then(resp => {
                // Hard reload the page
                window.location.reload(true);
              }, err => console.error("Failed to add DataONE API token:", err));
            }
          }
        });
      });
    },
    
    actions: {
      setResourceServer(selected) {
        this.set('newResourceServer', selected);
      },
      
      connectOAuthProvider(provider) {
        window.location.href = provider.url;
      },
      
      showConnectExtAcctModal(provider) {
        const component = this;
        component.set('selectedProvider', provider);
        component.apiCall.getExtAccountTargets(provider.name).then(targets => {
          component.get('selectedProvider').set('targets', targets);
          // Pop up a modal for choosing resource_server and entering a new API key
          $('#connect-apikey-modal').modal('show');
          $('#newResourceServerDropdown').dropdown();
        }, err => console.error("Failed to fetch provider targets:", err));
      },
      
      clearConnectExtAcctModal() {
        const component = this;
        
        // Reset modal state
        $('#newResourceServerDropdown').dropdown('clear');
        component.set('newApiKey', '');
        component.set('newResourceServer', '');
      },
      
      connectProvider(provider, newResourceServer, newApiKey) {
        const component = this;
        console.log("Connect confirmed:", provider);
        
        // POST back to /account/:provider/key
        component.apiCall.authExtToken(provider.name, newResourceServer, newApiKey).then(resp => {
          // Refresh view
          component.refreshUserTokens();
          
          // Close modal and reset state
          component.actions.clearConnectExtAcctModal.call(component);
        }, err => console.error("Failed to authorize external token:", err));
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
          component.refreshUserTokens();
        }, err => {
          console.error("Failed to revoke external token:", err);
          
          // FIXME: Server returns an error when attempting to redirect... silly.
          component.refreshUserTokens();
        });
        
      },
    }
});