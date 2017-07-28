import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    folderNavs : Ember.inject.service(),
    userAuth: Ember.inject.service(),

    layout,
    init () {
      this._super(...arguments);
      this.set("navs", this.get('folderNavs').getFolderNavs());
      this.set("user", this.get('userAuth').getCurrentUser());
      console.log(this.user);
    },
    actions: {
        navClicked : function(nav) {
            this.sendAction('action', nav);
        }
    }
});
