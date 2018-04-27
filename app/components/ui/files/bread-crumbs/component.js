import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
  internalState: Ember.inject.service(),

    actions: {
      breadcrumbClicked : function(item) {
        this.sendAction('action', item);

      },
    }
});
