import Component from '@ember/component';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import EmberObject, { observer } from '@ember/object';
import { later, cancel } from '@ember/runloop';
import $ from 'jquery';

const O = EmberObject.create.bind(EmberObject);

export default Component.extend({
  store: service(),
  userAuth: service(),
  apiCall: service('api-call'),
  internalState: service(),
  taleInstanceName: "",
  filteredSet: A(),
  filters: ['All', 'Mine', 'Published', 'Recent'],
  filter: 'All',
  numberOfModels: 0,
  pageNumber: 1,
  totalPages: 1,
  leftButtonState: "disabled",
  rightButtonState: "disabled",
  lastAnimationTime: 0,
  animationRefreshTime: 500, // min ms time between animation refreshes
  item: null,
  guid: null,
  models: A([]),
  modelsInView: A([]),
  listView: false,
  showFilter: true,
  loadingTales: true,
  selectedTale: O({}),
  message: 'Tales loading. Please, wait.',

  filterObserver: observer('filter', function () {
    this.setFilter.call(this);
  }),
  
  creatorObserver: observer('modelsInView', function() {
    this.modelsInView.forEach(tale => {
      const creatorId = tale.get("creatorId");
      this.store.findRecord('user', creatorId).then(creator => {
        tale.set('creator', O({
          firstName: creator.firstName,
          lastName: creator.lastName,
          orcid: ''
        }));
      }).catch(err => {
        let message = `Failed to fetch creator=${tale.creatorId} for tale=${tale._id}:`;
        console && (console.error && console.error(message, err)) || console.log(message, err);
        tale.set('creator', O({}));
      });
    });
  }),

  modelObserver: observer('filter', 'model', 'numberOfModels', function () {
    let guid = this.get('guid');

    if (!guid) {
      guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      this.set('guid', guid);
    }

    let d = new Date();
    let milliseconds = d.getTime();
    let lastMSTime = Number(this.get('lastAnimationTime'));

    if (milliseconds - lastMSTime > Number(this.get('animationRefreshTime'))) {
      $('.selectable.cards.' + guid + ' .image img')
        .transition('jiggle');
      this.set('lastAnimationTime', milliseconds);
    }
  }),

  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    let models = this.get("models");
    let component = this;
    component.set('loadingTales', false);
    component.set('searchView', models);

    component.updateModels(component, models);

    component.set('addButtonLogo', '/icons/plus-sign.png');
    component.setFilter();
  },
  didRender() {
    $('.selectable.cards .image').dimmer({
      on: 'hover'
    });
  },
  didUpdate() {

  },

  setFilter() {
    // 4 tabs public (all), mine, published, recently viewed
    const filter = this.get('filter');
    const models = this.get('models');
    this.set('loadingTales', true);

    if (filter === 'All') {
      this.set('filteredSet', models);
    } else if (filter === 'Mine') {
      const userId = this.get('userAuth').getCurrentUserID();
      this.set('filteredSet', models.filter(m => m.get('creatorId') === userId));
    } else if (filter === 'Published') {
      this.set('filteredSet', models.filter(m => {
        return m.get('published') === true;
      }));
    } else if (filter === 'Recent') {
      const recentTales = this.get('internalState').getRecentTales();
      this.set('filteredSet', models.filter(m => {
        return (recentTales.indexOf(m.get('id')) > -1);
      }));
    } else {
      this.set('filteredSet', A());
    }

    this.actions.searchFilter.call(this);
    this.actions.toggleFiltersVisibility.call(this);
  },

  updateModels(component, models) {
    if (!models.get('length')) {
      component.set('modelsInView', A([]));
    }
    let modelsInView = A([]);
    component.get('models').forEach(tale => {
      if (!tale.get("icon")) {
        if (tale.get("meta")) {
          let meta = tale.get("meta");
          if (meta.get('provider') !== "DataONE")
            tale.set('icon', "/icons/globus-logo-large.png");
          else
            tale.set('icon', "/icons/d1-logo-large.png");
        } else {
          tale.set('icon', "/images/whole_tale_logo.png");
        }
      }

      let description = tale.get('description');

      if (!description) {
        tale.set('tagName', "No Description ...");
      } else {
        if (description.length > 200)
          tale.set('tagName', description.substring(0, 200) + "..");
        else
          tale.set('tagName', description);
      }

      modelsInView.pushObject(O(tale));
    });

    component.set("modelsInView", modelsInView);
  },

  actions: {
    toggleListView() {
      let newValue = !this.get('listView');
      this.set('listView', newValue);
    },
    toggleFiltersVisibility() {
      let component = this;
      later(function() {
        let newValue = !component.get('showFilter');
        component.set('showFilter', newValue);
      }, 100);
    },
    removeCurrentFilter() {
      this.set('filter', 'All');
      this.setFilter();
    },
    searchFilter() {
      let searchStr = this.get('searchStr');

      const filteredSet = this.get("filteredSet");
      const component = this;

      let promise = new Promise((resolve, reject) => {
        let searchView = [];
        filteredSet.forEach(model => {
          let title = model.get('title');
          if (new RegExp(searchStr, "i").test(title)) {
            searchView.push(model);
          }
        });
        component.set('loadingTales', false);
        resolve(searchView);
      });

      promise.then((searchView) => {
        component.set('searchView', searchView);
        component.set('modelsInView', searchView);
      });
    },

    select(model) {
      this.set('item', model);
      this.sendAction('action', model); // sends to compose.js controller, action itemSelected, based on template spec.
    },

    attemptDeletion(model) {
      let component = this;
      if (model) {
        model.set('name', model.get('title'));
        let taleId = model.get('_id');
        let instances = component.get('store').query('instance', {
          taleId: taleId,
          reload: true,
          adapterOptions: {
            queryParams: {
              limit: "0"
            }
          }
        }).then((instances) => {
          if (instances && instances.length) {
            let message = `There ${instances.length === 1 ? "is" : "are"} ${instances.length} running instance${instances.length === 1 ? "" : "s"} associated to this tale.`;
            component.set('cannotDeleteMessage', message);
            component.actions.openWarningModal.call(this);
          } else {
            component.actions.openDeleteModal.call(this, model);
          }
        });
      }
    },

    openWarningModal() {
      let selector = `.ui.warning-modal.modal`;
      $(selector).modal('show');
    },

    openDeleteModal(model) {
      let component = this;
      if (model) {
        model.set('name', model.get('title'));
      }
      component.set('selectedTale', model);
      let selector = `.delete-modal-tale>.ui.delete-modal.modal`;
      later(() => {
        $(selector).modal('show');
      }, 500);
    },

    approveDelete(model) {
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(() => {
        // refresh
        component.updateModels(component, component.get('models'));
        component.set('selectedTale', undefined);
        component.setFilter();
      });

      return false;
    },

    denyDelete() {
      this.set('selectedTale', undefined);
      return false;
    },

    addNew() {
      this.sendAction("onAddNew");
    },

    launchTale(tale) {
      let component = this;

      component.set('tale_instantiating_id', tale.id);
      component.set('tale_instantiating', true);

      return this.get('apiCall').startTale(tale)
          .then((instance) => {
            component.set("instance", instance)
            this.get('apiCall').waitForInstance(instance)
              .then((instance) => {
                component.set("instance", instance);
                component.get('taleLaunched')();
              })
              .catch((err) => {
                // deal with the failure here
                component.set("tale_instantiating", false);
                component.set("tale_not_instantiated", true);
                let error = JSON.parse(err);
        
                component.set("error_msg", error.message);
        
                later(function () {
                  if(!component.isDestroyed){
                    component.set("tale_not_instantiated", false);
                    component.set("tale_instantiating_id", 0);
                  }
                }, 10000);
              });
          });
    }
  }
});
