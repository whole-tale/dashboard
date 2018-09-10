import EmberObject from '@ember/object';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default Service.extend({
  events: function() {
    let Events = EmberObject.extend(Evented, {
      select(allSelected) {
        this.trigger('select', allSelected);
      },

      selectEnvironment(environment) {
        this.trigger('selectEnvironment', environment);
      }
    });
    return Events.create();
  }()
});
