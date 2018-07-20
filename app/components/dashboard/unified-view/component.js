import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,

  store: Ember.inject.service(),
  internalState: Ember.inject.service(),

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
    console.log("Left View = " + this.get("leftView"));
    console.log("Right View = " + this.get("rightView"));
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
