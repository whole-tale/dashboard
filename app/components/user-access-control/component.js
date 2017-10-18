import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,

    levels: [
        {id:0, text:"Can View"},
        {id:1, text:"Can Edit"},
        {id:2, text:"Is Owner"}
    ],

    acl: {
        users: [],
        groups: [],
    },

    actions: {
        removeUserOrGroup(userOrGroup) {
            //if user is the owner, then deny
            if(userOrGroup.level === 2) { 
                return;
                // throw new Error("Cannot remove the owner.");
            }

            let acl = this.get('acl');

            //if user remove from users
            if(userOrGroup.login) {
                this.set('acl.users', acl.users.filter(u=>u.id!==userOrGroup.id));
            } else { //is group
                this.set('acl.groups', acl.groups.filter(g=>g.id!==userOrGroup.id));
            }
        },
    }
});