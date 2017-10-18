import Ember from 'ember';
import layout from './template';
import config from '../../config/environment';

export default Ember.Component.extend({
    layout,

    authRequest: Ember.inject.service(),
    internalState: Ember.inject.service(),
    store: Ember.inject.service(),

    object: {},
    granted: {},

    publicFlags: Ember.A(),
    recurse: true,
    progress: true,

    selectedUser: {},

    didInsertElement() {
        const component = this;
        const state = this.get('internalState');
        Ember.$('.acl-component').modal('setting', {
            onShow: function() {
                let object = state.getACLObject();
                component.set('object', object);

                const request = component.get('authRequest');
                let options = {
                    method: 'GET',
                    headers: { 'content-type': 'application/json' }
                };
                let url = `${config.apiUrl}/${object._modelType}/${object._id}/access`;

                request.send(url, options)
                    .then(acl=> {  
                        component.set('granted', {users:acl.users, groups:acl.groups});
                    })
                    .catch(e => {
                        console.log(e);
                    })
                ;
            },
            autofocus: false
        });
    },

    clearModal() {
        this.set('granted', Ember.A());
        this.set('userOrGroup', {});
        this.set('public', false);
        this.set('publicFlags', Ember.A());
        this.set('recurse', false);
        this.set('progress', true);
    },

    actions: {
        addUserOrGroup() {   
            let selectedUser = this.get('selectedUser');
            if(!selectedUser) { return; }

            let granted = this.get('granted');

            //if user add to users
            if(selectedUser.login) { 
                this.set('granted.users', granted.users.filter(u=>u.id!==selectedUser._id));
                granted.users.push({
                    flags:[],
                    id: selectedUser._id,
                    level: 0,
                    login: selectedUser.login,
                    name: selectedUser.name
                });
                granted.users.arrayContentDidChange();
            } else {
                this.set('granted.groups', granted.groups.filter(u=>u.id!==selectedUser._id));
                granted.groups.push({
                    flags:[],
                    id: selectedUser._id,
                    level: 0,
                    name: selectedUser.name
                });
                granted.groups.arrayContentDidChange();
            }
        },
    
        submit() {
            const request = this.get('authRequest');
            const object = this.get('object');
            let options = {
                method: 'PUT',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                data: {
                    access: JSON.stringify(this.get('granted')),
                    public: object.public,
                    publicFlags: this.get('publicFlags'),
                    recurse: this.get('recurse'),
                    progress: this.get('progress')
                }
            };
            this.get('store').findRecord(object._modelType, object._id)
                .then(record => {
                    record.set('public', object.public);
                    record.save();
                })
            ;
            let url = `${config.apiUrl}/${this.get('object')._modelType}/${this.get('object')._id}/access`;
            request.send(url, options);
            this.clearModal();
        },

        cancel() {
            this.clearModal();
        }
    }
});
