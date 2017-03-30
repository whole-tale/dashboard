import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    folderNavs : Ember.inject.service(),
    layout,
    init () {
      this._super(...arguments);
      this.set("navs", this.get('folderNavs').getFolderNavs());
    },
    actions: {
        navClicked : function(nav) {
            this.sendAction('action', nav);
        }
    }
});
