import Ember from 'ember';
import layout from './template';
import config from '../../config/environment';

export default Ember.Component.extend({
    layout,

    accessControl: Ember.inject.service(),
    internalState: Ember.inject.service(),
    store: Ember.inject.service(),

    error: false,

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

                component.get('accessControl').fetch(object)
                    .then(acl=> {  
                        component.set('granted', {users:acl.users, groups:acl.groups});
                    })
                    .catch(e => {
                        console.log(e);
                        component.set('error', e.responseJSON.message);
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
        this.set('error', false);
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
            const object = this.get('object');
            const granted = this.get('granted');
    
            let options = {
                publicFlags: this.get('publicFlags'),
                recurse: this.get('recurse'),
                progress: this.get('progress')
            };

            this.get('accessControl').update(object, granted, options);
            this.clearModal();
        },

        cancel() {
            this.clearModal();
        }
    }
});
