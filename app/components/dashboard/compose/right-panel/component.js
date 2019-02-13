import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  wtEvents: service(),
  classNameBindings: ['showUpperPanel', 'showLowerPanel'],
  showUpperPanel: true,
  showLowerPanel: false,

  init() {
    this._super(...arguments);
    const self = this;
    let events = self.get('wtEvents').events;

    // Wait for an event that asks for the file browser to be disabled
    events.on('onDisableRightPanel', function () {
      self.set('showLowerPanel', false);
    });
  },


  willDestroyElement () {
    this._super(...arguments);
    let events = this.get('wtEvents').events;
    events.off('onDisableRightPanel');
  },

  actions: {
    dummy: function() {
      //this.sendAction('action');
    },
    onLeftModelChange : function (model) {
      this.sendAction('onLeftModelChange', model); // sends to parent component
    },
  }

});
