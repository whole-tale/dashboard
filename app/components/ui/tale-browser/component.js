import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { later, cancel } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  store: service(),
  userAuth: service('user-auth'),
  apiCall: service('api-call'),
  internalState: service('internal-state'),
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
  listView: false,
  showFilter: true,
  loadingTales: true,
  selectedTale: EmberObject.create({}),
  message: 'Tales loading. Please, wait.',
  
  

  filterObserver: computed('filter', function () {
    this.setFilter.call(this);
  }),

  modelObserver: computed('filter', 'model', 'numberOfModels', function () {
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
      component.set('modelsInView', []);
    }
    let modelsInView = [];
    component.get('models').forEach(model => {
      if (!model.get("icon")) {
        if (model.get("meta")) {
          let meta = model.get("meta");
          if (meta.get('provider') !== "DataONE")
            model.set('icon', "/icons/globus-logo-large.png");
          else
            model.set('icon', "/icons/d1-logo-large.png");
        } else {
          model.set('icon', "/images/whole_tale_logo.png");
        }
      }

      let description = model.get('description');

      if (!description) {
        model.set('tagName', "No Description ...");
      } else {
        if (description.length > 200)
          model.set('tagName', description.substring(0, 200) + "..");
        else
          model.set('tagName', description);
      }

      modelsInView.push(model);
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
    
    closeCopyOnLaunchModal() {
      const component = this;
      $('#copy-on-launch-modal').modal('hide');
      component.set('taleToCopy', null);
    },
    
    openCopyOnLaunchModal(taleToCopy) {
      const component = this;
      $('#copy-on-launch-modal').modal('show');
      component.set('taleToCopy', taleToCopy);
    },
    
    submitCopyAndLaunch(taleToCopy) {
      const component = this;
      component.set('copyingTale', true);
      const originalTale = component.get('taleToCopy');
      if (originalTale) {
        component.get('apiCall').copyTale(originalTale).then(taleCopy => {
          component.set('copyingTale', false);
          component.actions.closeCopyOnLaunchModal.call(component);
          
          // Convert JSON response to an EmberObject
          let eTaleCopy = EmberObject.create(taleCopy);
          
          // Push to models in view
          // TODO: Detect filtered view?
          console.log('Adding tale copy:', eTaleCopy);
          const tales = component.get('modelsInView');
          tales.pushObject(eTaleCopy);
          component.set('modelsInView', A(tales));
          
          // Launch the newly-copied tale
          component.actions.launchTale.call(component, eTaleCopy).then(function(arg) {
            console.log('Tale instance launching!', arg);
            component.set("tale_instantiating", false);
            component.set("tale_not_instantiated", false);
            component.set("tale_instantiated", true);
          }).catch(function(err) {
            console.log('Tale instance failed to launch:', err);
            // deal with the failure here
            component.set("tale_instantiating", false);
            component.set("tale_instantiated", true);
            component.set("tale_not_instantiated", false);
          });
        });
      } else {
        console.log('No tale to copy... something went wrong!');
      }
    },

    launchTale(tale) {
      let component = this;
      if (tale._accessLevel < 1) {
        // Prompt for confirmation before copying and launching
        component.actions.openCopyOnLaunchModal.call(component, tale);
        return;
      }

      component.set("tale_instantiating_id", tale.id);
      component.set("tale_instantiating", true);

      let onSuccess = function (item) {
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);

        let instance = EmberObject.create(JSON.parse(item));

        component.set("instance", instance);

        //Add the new instance to the list of instances in the right panel
        component.get('taleLaunched')();

        later(function () {
          // Ensure this component is not destroyed by way of a route transition
          if(!component.isDestroyed){
            component.set("tale_instantiated", false);
            component.set("tale_instantiating_id", 0);
          }
        }, 30000);

        let currentLoop = null;
        // Poll the status of the instance every second using recursive iteration
        let startLooping = function(func){
          return later(function(){
            currentLoop = startLooping(func);
            component.get('store').findRecord('instance', instance.get('_id'), { reload:true })
              .then(model => {
                if(model.get('status') === 1) {
                  component.get('taleLaunched')();
                  cancel(currentLoop);
                }
              });
          }, 1000);
        };

        //Start polling
        currentLoop = startLooping();
      };

      let onFail = function (item) {
        // deal with the failure here
        component.set("tale_instantiating", false);
        component.set("tale_not_instantiated", true);
        item = JSON.parse(item);

        component.set("error_msg", item.message);

        later(function () {
          if(!component.isDestroyed){
            component.set("tale_not_instantiated", false);
            component.set("tale_instantiating_id", 0);
          }
        }, 10000);

      };

      // submit: API
      // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

      return this.get("apiCall").postInstance(
        tale.get("_id"),
        tale.get("imageId"),
        null,
        onSuccess,
        onFail);
    }
  }
});
