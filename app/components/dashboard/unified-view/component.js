import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  layout,

  store: service(),
  internalState: service(),

  leftTitle: null,
  leftView: null,
  leftPanelColor: null,
  leftModel: null,

  rightTitle: null,
  rightView: null,
  rightPanelColor: null,

  // selectedEnvironment: null,

  init() {
    this._super(...arguments);
  },
  didRender() {},

  actions: {
    onLeftModelChange: function (model) {
      this.set("leftModel", model);
    },
    taleLaunched: function () {
      // Update right panel models
      let self = this;
      // NOTE: using store.query here as a work around to disable store.findAll caching
      this.get('store').query('instance', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }).then(models => {
        // Ensure this component is not destroyed by way of route transition
        if (!self.isDestroyed) {
          self.set('rightModelTop', models);
        }
      });
    },
  }
});
