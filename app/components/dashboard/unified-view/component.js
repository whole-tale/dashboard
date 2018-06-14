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

    init() {
      this._super(...arguments);
      console.log("Left View = " + this.get("leftView"));
      console.log("Right View = " + this.get("rightView"));
    },
    didRender() {
    },

    actions: {
      onLeftModelChange: function (model) {
        this.set("leftModel", model);
      },
      taleLaunched: function() {
        // TODO convert this interaction to use the wholetale events service instead
        // Update model and test if the interface updates automatically
        let self = this;
        this.get('store').unloadAll('instance');
        this.get('store').findAll('instance', { reload: true, adapterOptions: { queryParams:{sort: "created", sortdir: "-1", limit: "0"}} })
          .then(models => {
            self.set('rightModelTop', models);
          });
      },
    }
});
