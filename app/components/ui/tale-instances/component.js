import Component from '@ember/component';
import EmberObject, { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { later } from '@ember/runloop';
import { Promise } from 'rsvp';
import $ from 'jquery';

export default Component.extend({
  router: service(),
  store: service(),
  userAuth: service(),
  apiCall: service('api-call'),
  internalState: service(),

  taleInstanceName: '',
  filteredSet: A(),
  filters: computed(function() {
    return ['All', 'Mine', 'Published', 'Recent'];
  }),
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
  selectedInstance: EmberObject.create({}),
  classNameBindings: ['showSearch'],

  filterObserver: observer('searchStr', function () {
    this.setFilter.call(this);
  }),

  setFilter() {
    this.actions.search.call(this);
  },

  init() {
    this._super(...arguments);
  },
  didRender() {
    let component = this;
    this.get("models").forEach(function (instance) {
      component.get('store').findRecord('tale', instance.get('taleId'), { 
        reload: true, 
        backgroundReload: false
      })
      .then(tale => {
        instance.set('tale', tale);
      });
    });
    let selected = component.get('models').filter(model => model.id === component.internalState.currentInstanceId);
    if(!(selected && selected.length)) {
      component.internalState.set('currentInstanceId', undefined);
    }
  },

  actions: {
    selectInstance(model, index) {
      let component = this;
      component.set('selectedInstance', model);
      component.set('selectedMenuIndex', index);
      // should trigger an event later
      // component.get('wtEvents').events.selectEnvironment(this.get('selectedInstance'));
      // this.sendAction('onLeftModelChange', model); // sends evnt to parent component
    },

    deselectInstance() {
      let component = this;
      component.set('selectedInstance', EmberObject.create({}));
      component.set('selectedMenuIndex', -1);
      component.get('internalState').set('currentInstanceId', undefined);
      // component.get('wtEvents').events.selectEnvironment(this.get('selectedInstance'));
    },

    openDeleteModal(instance) {
      let component = this;
      component.set('selectedInstance', instance);
      let selector = `.delete-modal-instance>.ui.delete-modal.modal`;
      later(() => {
        $(selector).modal('show');
      }, 500);
    },

    approveDelete(model) {
      let component = this;
      component.set('deletingInstance', true);

      model.destroyRecord({
        reload: true,
        backgroundReload: false
      }).then(function () {
          let selectedInstanceId = component.get('internalState').get('currentInstanceId');
          component.set('selectedInstance', undefined);
          component.set('selectedMenuIndex', -1);
          // TODO replace this workaround for deletion with something more robust
          //component.get('store').unloadRecord(model);
          component.get('internalState').set('currentInstanceId', undefined);
          // transition to the run route if the current route is run.view
          let router = component.get('router');
          if(router.get('currentRouteName') === 'run.view'){
            // XXX: Workaround for async delete issues - timeout may need to be increased
            setTimeout(() => {
              component.actions.deselectInstance.call(component);
              if (selectedInstanceId === model.get('_id')) {
                router.transitionTo('run.index');
              }
              component.set('deletingInstance', false);
            }, 2000);
          } else {
            component.set('deletingInstance', false);
          }
      });

      return false;
    },

    denyDelete() {
      return true;
    },

    search() {
      let searchStr = this.get('searchStr').trim();
      const models = this.get('models');
      const component = this;

      let promise = new Promise((resolve) => {
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
          component.set('selectedInstance', Object.create({}));
          // component.get('wtEvents').events.selectEnvironment(this.get('selectedInstance'));
        }
        // component.updateModels(component, searchView);
      });
    },

    addNew() {
      this.sendAction("onAddNew");
    },

    transitionToRun(instance, index) {
      let router = this.get('router');
      if(router.currentRouteName !== 'browse' && (!instance || this.internalState.get('currentInstanceId') === instance._id)) {
        // toggle selection if we're in '/run' route and there's an already selected instance
        this.internalState.set('currentInstanceId', undefined);
        this.actions.deselectInstance.call(this);
        // ...and navigate to 'run.index'
        router.transitionTo('run.index');
      } else {
        this.actions.selectInstance.call(this, instance, index);
        router.transitionTo('run.view', instance._id);
      }
    }
  }
});
