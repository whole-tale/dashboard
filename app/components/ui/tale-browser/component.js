import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { computed, observer} from '@ember/object';
import { A } from '@ember/array';
import { later, cancel } from '@ember/runloop';
import $ from 'jquery';

const O = EmberObject.create.bind(EmberObject);

export default Component.extend({
  store: service(),
  userAuth: service('user-auth'),
  apiCall: service('api-call'),
  internalState: service('internal-state'),
  router: service(),

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
      if (tale && tale.id) {
        this.apiCall.fetchTaleData(tale.id, false);
      }
    });
  }),
  
  instancePoller: observer('modelsInView', 'instances', function() {
    // When instance models change, check if we need to poll
    this.modelsInView.forEach(model => {
      // If we see an instance that is "Launching", poll until it completes
      if (model.instance && model.instance.status === 0) {
        this.apiCall.waitForInstance(model.instance);
      }
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
    component.set('searchView', models.tales);
    component.updateModels(component, models.tales);
    component.set('addButtonLogo', '/icons/plus-sign.png');
    component.setFilter();
    
    // Check if any instance is LAUNCHING
    component.get('store').findAll('instance').then(instances => {
        instances.forEach(instance => {
            // If any instance is LAUNCHING, poll until it finishes
            if (!instance.status) {
                console.log('Instance is LAUNCHING. Starting poller...');
                component.get('apiCall').waitForInstance(instance);
            }
        });
    }).catch(err => console.error(err));
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
      this.set('filteredSet', models.tales);
    } else if (filter === 'Mine') {
      const userId = this.get('userAuth').getCurrentUserID();
      this.set('filteredSet', models.tales.filter(m => m.creatorId === userId));
    } else if (filter === 'Published') {
      this.set('filteredSet', models.tales.filter(m => {
        return m.publishInfo.length;
      }));
    } else if (filter === 'Recent') {
      const recentTales = this.get('internalState').getRecentTales();
      this.set('filteredSet', models.tales.filter(m => {
        return (recentTales.indexOf(m.get('id')) > -1);
      }));
    } else {
      this.set('filteredSet', A());
    }

    this.actions.searchFilter.call(this, filter);
    this.actions.toggleFiltersVisibility.call(this);
  },

  updateModels(component, models) {
    let modelsInView = A([]);
    models.forEach(tale => {
      if (tale && tale._id) {
        
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
      }
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
    selectFilter(filter) {
      const component = this;
      component.set('filter', filter);
      this.setFilter();
    },
    searchFilter(filter) {
      let searchStr = this.get('searchStr');
      
      const filteredSet = this.get("filteredSet");
      const component = this;
      
      return new Promise((resolve, reject) => {
        let searchView = [];
        filteredSet.forEach(model => {
          if (model && model.id) {
            let title = model.get('title');
            if (new RegExp(searchStr, "i").test(title)) {
              searchView.push(model);
            }
          }
        });
        component.set('loadingTales', false);
        resolve(searchView);
      }).then((searchView) => {
        component.set('searchView', searchView);
        component.set('modelsInView', searchView);
      });
    },

    select(model) {
      this.set('item', model);
      this.sendAction('action', model); // sends to compose.js controller, action itemSelected, based on template spec.
    },

    attemptDeletion(tale) {
      let component = this;
      if (tale) {
        let instance = tale.get('instance');
        if (instance) {
            let message = `There is at least one running instance associated to this Tale. You must shut it down before deleting the Tale.`;
            component.set('cannotDeleteMessage', message);
            component.actions.openWarningModal.call(this);
        } else {
            component.actions.openDeleteModal.call(this, tale);
        }
      }
    },

    openWarningModal() {
      let selector = `.ui.warning-modal.modal`;
      $(selector).modal('show');
    },

    openDeleteModal(tale) {
      let component = this;
      component.set('selectedTale', tale);
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
        component.updateModels(component, component.get('models').tales);
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
    
    openCopyOnLaunchModal(taleToCopy) {
      const component = this;
      $('#copy-on-launch-modal').modal('show');
      component.set('taleToCopy', taleToCopy);
    },
    
    dismissLaunchError(tale) {
      tale.set('launchStatus', 'stopped');
      tale.set('launchError', null);
      tale.set('launchResetRequest', null);
    },
    
    submitCopyAndLaunch(taleToCopy) {
      const self = this;
      self.set('copyingTale', true);
      const originalTale = self.get('taleToCopy');
      if (originalTale) {
        self.get('apiCall').copyTale(originalTale).then(taleCopy => {
          self.set('copyingTale', false);
          self.actions.closeCopyOnLaunchModal.call(self);
          
          // Convert JSON response to an EmberObject
          let eTaleCopy = EmberObject.create(taleCopy);
          
          
          // Push to models in view, if it should be shown
          if (self.get('filter') === 'Mine') {
            const tales = self.get('modelsInView');
            tales.pushObject(eTaleCopy);
            self.set('modelsInView', A(tales));
          }
          
          // Launch the newly-copied tale
          eTaleCopy.set('launchStatus', 'starting');
          return self.get('apiCall').startTale(eTaleCopy).then((instance) => {
            eTaleCopy.set('instance', instance);
            self.get('apiCall').waitForInstance(instance).then(() => {
              eTaleCopy.set('launchError', null);
              eTaleCopy.set('launchStatus', 'started');
            });
            later(() => self.router.transitionTo('run.view', eTaleCopy._id), 500);
          }).catch(err => {
            console.error('Failed to launch Tale', err);
            eTaleCopy.set('launchError');
            eTaleCopy.set('launchStatus', 'error');
          });
        });
      } else {
        console.log('No tale to copy... something went wrong!');
      }
    },

    startTale(tale) {
      const self = this;
      if (tale._accessLevel < 1) {
        // Prompt for confirmation before copying and launching
        return self.actions.openCopyOnLaunchModal.call(self, tale);
      }
      
      tale.set('launchError', null);
      tale.set('launchStatus', 'starting');
      return self.apiCall.startTale(tale).then((instance) => {
        tale.set('instance', instance);
        self.get('apiCall').waitForInstance(instance).then(() => {
          tale.set('launchError', null);
          tale.set('launchStatus', 'started');
        });
        self.router.transitionTo('run.view', tale._id);
      }).catch(err => {
        console.error('Failed to launch Tale', err);
        tale.set('launchError', err.message || err);
        tale.set('launchStatus', 'error');
      });
    },
    
    stopTale(tale) {
      const self = this;
      
      // Reset state manually when re-launching
      tale.set('launchError', null);
      tale.set('launchStatus', 'stopping');
      tale.set('launchResetRequest', null);
      
      // TODO: Abstract this to reusable helper?
      let resetStatusAfterMs = (tale, delay) => {
        let resetRequest = later(() => {
          if (!self.isDestroyed) {
            console.log('Resetting tale status:', tale);
            tale.set('launchError', null);
            tale.set('launchStatus', null);
            tale.set('launchResetRequest', null);
          }
        }, delay);
        tale.set('launchResetRequest', resetRequest);
      };
    
      // TODO: Abstract this to reusable helper?
      let handleStopError = (tale, err) => {
        // deal with the failure here
        tale.set('launchStatus', 'error');
        tale.set('launchError', err.message || err);
        if (console && console.error) {
          console.error('Failed to stop Tale', err);
        } else {
          console.log('Failed to stop Tale', err);
        }
        
        resetStatusAfterMs(tale, 10000);
      };
      
      // Add an artificial delay to make the user feel good
      tale.instance.set('status', 0);
      later(() => {
        this.apiCall.stopTale(tale).then((instance) => {
          tale.set('launchError', null);
          tale.set('launchStatus', null);
          console.log('Tale is now stopped:', tale);
          resetStatusAfterMs(tale, 10000);
        }).catch((err) => handleStopError(tale, err));
      }, 1500);
    },
  }
});
