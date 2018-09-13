import Ember from 'ember';

export default Ember.Component.extend({
  router: Ember.inject.service(),
  store: Ember.inject.service(),
  userAuth: Ember.inject.service(),
  apiCall: Ember.inject.service('api-call'),
  internalState: Ember.inject.service(),

  taleInstanceName: "",
  filteredSet: Ember.A(),
  filters: ['All', 'Mine', 'Published', 'Recent'],
  filter: 'All',
  numberOfModels: 0,
  searchStr: '',
  pageNumber: 1,
  totalPages: 1,
  leftButtonState: "disabled",
  rightButtonState: "disabled",
  lastAnimationTime: 0,
  animationRefreshTime: 500, // min ms time between animation refreshes
  guid: null,
  selectedMenuIndex: -1,
  selectedInstance: Ember.Object.create({}),
  classNameBindings: ['showSearch'],

  filterObserver: Ember.observer('searchStr', function () {
    this.setFilter.call(this);
  }),

  setFilter() {
    this.actions.search.call(this);
  },

  init() {
    this._super(...arguments);
    let component = this;

    this.get("models").forEach(function (instance) {
      component.get('store').findRecord('tale', instance.get('taleId'))
        .then(tale => {
          instance.set('tale', tale);
        });
    });
  },
  didRender() {},
  didUpdate() {
    let component = this;

    this.get("models").forEach(function (instance) {
      component.get('store').findRecord('tale', instance.get('taleId'))
        .then(tale => {
          instance.set('tale', tale);
        });
    });
  },

  actions: {
    selectInstance: function (model, index) {
      let component = this;
      component.set('selectedInstance', model);
      component.set('selectedMenuIndex', index);
      // should trigger an event later
      // component.get('wtEvents').events.selectEnvironment(this.get('selectedInstance'));
      console.log('selected instance: ' + model.name);
      // this.sendAction('onLeftModelChange', model); // sends evnt to parent component
    },

    deselectInstance() {
      let component = this;
      component.set('selectedInstance', Ember.Object.create({}));
      component.set('selectedMenuIndex', -1);
      // component.get('wtEvents').events.selectEnvironment(this.get('selectedInstance'));
    },

    openDeleteModal: function (instance) {
      let component = this;
      component.set('selectedInstance', instance);
      let selector = `.delete-modal-instance>.ui.delete-modal.modal`;
      console.log("Selector: " + selector);
      Ember.run.later(() => {
        $(selector).modal('show');
      }, 500);
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
          component.set('selectedInstance', undefined);
          component.set('selectedMenuIndex', -1);
          // TODO replace this workaround for deletion with something more robust
          component.get('store').unloadRecord(model);
          component.get('internalState').set('currentInstanceId', null);
          //transition to the run route if the current route is run.view
          let router = component.get('router');
          if(router.get('currentRouteName') === 'run.view'){
            router.transitionTo('run');
          }
        });

      return false;
    },

    denyDelete: function () {
      return true;
    },

    search: function () {
      let searchStr = this.get('searchStr').trim();
      const models = this.get('models');
      const component = this;

      let promise = new Ember.RSVP.Promise((resolve) => {
        let searchView = [];
        models.forEach(model => {
          let name = model.get('name');
          if (~name.toLowerCase().indexOf(searchStr.toLowerCase())) {
            searchView.push(model);
          }
        });
        resolve(searchView);
      });

      promise.then((searchView) => {
        component.set('modelsInView', searchView);
        let selected = searchView.filter((tale, i) => {
          if (tale.id === component.get('selectedInstance').id) {
            component.set('selectedMenuIndex', i);
          }
          return tale.id === component.get('selectedInstance').id;
        });
        if (!selected.length) {
          component.set('selectedMenuIndex', -1);
          // component.set('selectedInstance', Ember.Object.create({}));
          // component.get('wtEvents').events.selectEnvironment(this.get('selectedInstance'));
        }
        // component.updateModels(component, searchView);
      });
    },

    addNew: function () {
      this.sendAction("onAddNew");
    },

    transitionToRun: function (instance, index) {
      this.actions.selectInstance.call(this, instance, index);
      // console.log('transitionToRun');
      // if clicked outside of delete icon
      // if (event && event.target && !$(event.target).hasClass('times')) {
      this.get('router').transitionTo('run.view', instance._id);
      // }
    }

  }
});
