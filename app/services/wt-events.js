import EmberObject from '@ember/object';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default Service.extend({
  events: function() {
    let Events = EmberObject.extend(Evented, {

      /**
      * @method select
      */
      select(allSelected) {
        this.trigger('select', allSelected);
      },

      /**
      * Lets the environment widget know to select an environment by model
      *
      * @method selectEnvironment
      */
      selectEnvironment(environment) {
        this.trigger('selectEnvironment', environment);
      },

      /**
      * Lets the environment widget know to select an environment by 
      * name.
      * @method selectEnvironmentByName
      * @param {String} environmentName The name of the environment
      */
      selectEnvironmentByName(environmentName) {
        this.trigger('selectEnvironmentByName', environmentName);
      },

      /**
      * Lets the right panel know to disable part of the right panel
      *
      * @method disableRightPanel
      */
      disableRightPanel() {
        this.trigger('onDisableRightPanel');
      }

    });
    return Events.create();
  }()
});
