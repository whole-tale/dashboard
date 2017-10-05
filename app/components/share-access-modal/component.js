import Ember from 'ember';
import layout from './template';
import _ from 'lodash/lodash';

export default Ember.Component.extend({
    layout,

    store: Ember.inject.service(),

    object: {},
    granted: Ember.A(),

    public: false,
    publicFlags: Ember.A(),
    recurse: false,
    progress: true,

    didInsertElement() {
        Ember.run.schedule('afterRender', function() {
            // fetch current granted users only if not already passed into the component
            if(this.get('granted').length) { return; }

            let component = this;
            this.get('store').query(this.get('object').get('_modelType'), {adapterOptions: {appendPath: "access"}})
                .then(granted => {
                    component.set('granted', granted);
                })
                .catch(e => {
                    console.log(e);
                });
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
        addUserOrGroup(userOrGroup) {   
            let granted = this.get('granted').concat([]);   //copy trick... granted [] is immutable

            //if user add to users
            if(_.has(userOrGroup, 'login')) {
                granted.users.push(userOrGroup);
            } else { //is group
                granted.groups.push(userOrGroup);
            }

            this.set('granted', granted);
        },
        removeUserOrGroup(userOrGroup) {
            //if user is the owner, then deny
            if(userOrGroup.level === 2) { 
                return;
                // throw new Error("Cannot remove the owner.");
            }

            let granted = this.get('granted').concat([]);   //copy trick... granted [] is immutable

            //if user remove from users
            if(_.has(userOrGroup, 'login')) {
                granted.users = granted.users.filter(u=>u.id!==userOrGroup.id);
            } else { //is group
                granted.groups = granted.groups.filter(g=>g.id!==userOrGroup.id);
            }

            this.set('granted', granted);
        },
        submit() {
            let options = {
                adapterOptions: {
                    appendPath: "access",
                    queryParams: {
                        access: JSON.stringify(this.get('granted')),
                        public: this.get('public'),
                        publicFlags: this.get('publicFlags'),
                        recurse: this.get('recurse'),
                        progress: this.get('progress')
                    }
                }
            };
            this.get('object').save(options);
            this.clearModal();
        },
        cancel() {
            this.clearModel();
        }
    }
});
