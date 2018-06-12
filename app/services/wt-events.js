import EmberObject from '@ember/object';
import Evented from '@ember/object/evented';

export default Ember.Service.extend({
  events: function() {
    let Events = EmberObject.extend(Evented, {
      select(allSelected) {
        this.trigger('select', allSelected);
      },

      
    });
    return Events.create();
  }()
});
