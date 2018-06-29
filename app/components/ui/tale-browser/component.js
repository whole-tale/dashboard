import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userAuth: Ember.inject.service(),
  apiCall: Ember.inject.service('api-call'),
  internalState: Ember.inject.service(),
  taleInstanceName: "",
  filteredSet: Ember.A(),
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
  selectedTale: Ember.Object.create({}),
  message: 'Tales loading. Please, wait.',

  filterObserver: Ember.observer('filter', function () {
    this.setFilter.call(this);
  }),

  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    let models = this.get("models");
    let component = this;
    component.set('loadingTales', false);

    if (component.get('addButtonName') != null) {
      component.set('paginateOn', models.length);
    }
    component.set('searchView', models);
    component.paginate(component, models);

    this.set('addButtonLogo', '/icons/plus-sign.png');
    this.setFilter();
  },
  didRender() {
    $('.selectable.cards .image').dimmer({
      on: 'hover'
    });
  },
  didUpdate() {
    //TODO schedule once to avoid race condition
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
      this.set('filteredSet', Ember.A());
    }

    this.actions.searchFilter.call(this);
    this.actions.toggleFiltersVisibility.call(this);
  },

  paginate(component, models) {
    let paginateSize = component.get('paginateOn');
    let pageNumber = component.get('pageNumber');
    let arraySize = models.get('length');

    let totalPages = Math.ceil(arraySize / paginateSize);

    component.set('numberOfModels', arraySize);

    if (models.get('length') === 0) {
      component.set("modelsInView", []);
      component.set("paginateArray", []);
      component.set('rightButtonState', "disabled");
      component.set('lefttButtonState', "disabled");
      component.set('totalPages', 0);
      return;
    }

    component.set('totalPages', totalPages);

    let modelsInView = [];
    let paginateArray = [];

    for (let i = 1; i <= totalPages; ++i) {
      if (i == pageNumber)
        paginateArray[i] = {
          number: i,
          state: "active"
        };
      else
        paginateArray[i] = {
          number: i,
          state: ""
        };
    }

    component.set("paginateArray", paginateArray);

    if (pageNumber === 1)
      component.set('leftButtonState', "disabled");
    else
      component.set('leftButtonState', "");

    if (pageNumber === totalPages)
      component.set('rightButtonState', "disabled");
    else
      component.set('rightButtonState', "");

    let startIndex = (pageNumber - 1) * paginateSize;
    let endIndex = startIndex + paginateSize;

    models.forEach(model => {
      if (!model.get("icon") || typeof model.get("icon") === "undefined") {
        if (model.get("meta") && typeof model.get("meta") !== "undefined") {
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

      if ((description == null)) {
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
    toggleListView: function() {
      let newValue = !this.get('listView');
      this.set('listView', newValue);
    },
    toggleFiltersVisibility: function() {
      let newValue = !this.get('showFilter');
      this.set('showFilter', newValue);
    },
    removeCurrentFilter: function() {
      this.set('filter', 'All');
      this.setFilter();
    },
    leftButtonClicked: function () {
      if (this.get('leftButtonState') === "disabled") return;
      this.set('pageNumber', this.get('pageNumber') - 1);
      this.paginate(this, this.get('searchView'));
    },
    rightButtonClicked: function () {
      if (this.get('rightButtonState') === "disabled") return;
      this.set('pageNumber', this.get('pageNumber') + 1);
      this.paginate(this, this.get('searchView'));
    },
    tabClicked: function (tabNumber) {
      this.set('pageNumber', tabNumber);
      this.paginate(this, this.get('searchView'));
    },
    searchFilter: function () {
      let searchStr = this.get('searchStr');

      const filteredSet = this.get("filteredSet");
      const component = this;

      let promise = new Ember.RSVP.Promise((resolve) => {
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
        component.paginate(component, searchView);
      });
    },

    select: function (model) {
      this.set('item', model);
      this.sendAction('action', model); // sends to compose.js controller, action itemSelected, based on template spec.
    },

    attemptDeletion(model) {
      let component = this;
      if(model) {
        model.set('name', model.get('title'));
        let taleId = model.get('_id');
        let instances = component.get('store').query('instance', {
          taleId: taleId
        }).then((instances) => {
          if(instances && instances.length) {
            let message = `There ${instances.length === 1 ? "is" : "are"} ${instances.length} running instance${instances.length === 1 ? "" : "s"} associated to this tale.`;
            component.set('cannotDeleteMessage', message);
            console.log(`${message}. Cannot delete tale ${model.get('title')}`);
            component.actions.openWarningModal.call(this);
          } else {
            component.actions.openDeleteModal.call(this, model);
          }
        });
      }
    },

    openWarningModal() {
      let selector = `.ui.warning-modal.modal`;
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    openDeleteModal(model) {
      let component = this;
      if(model) {
        model.set('name', model.get('title'));
      }
      component.set('selectedTale', model);
      let selector = `.delete-modal-tale>.ui.delete-modal.modal`;
      console.log("Selector: " + selector);
      Ember.run.later(() => {
        console.log('showing modal now');
        $(selector).modal('show');
      }, 500);
    },

    approveDelete: function (model) {
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
        // refresh
        // component.get('store').findAll('tale', { reload: true }).then(function(tales) {
        component.paginate(component, component.get('models'));
        component.set('selectedTale', undefined);
        // });
      });

      return false;
    },

    denyDelete: function () {
      this.set('selectedTale', undefined);
      return false;
    },

    addNew: function () {
      this.sendAction("onAddNew");
    },

    launchTale: function (tale) {
      let component = this;

      component.set("tale_instantiating_id", tale.id);
      component.set("tale_instantiating", true);

      let onSuccess = function (item) {
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);

        let instance = Ember.Object.create(JSON.parse(item));

        component.set("instance", instance);

        //Add the new instance to the list of instances in the right panel
        component.get('taleLaunched')();

        Ember.run.later((function () {
          component.set("tale_instantiated", false);
          component.set("tale_instantiating_id", 0);
        }), 30000);
      };

      let onFail = function (item) {
        // deal with the failure here
        component.set("tale_instantiating", false);
        component.set("tale_not_instantiated", true);
        item = JSON.parse(item);

        component.set("error_msg", item.message);

        Ember.run.later((function () {
          component.set("tale_not_instantiated", false);
          component.set("tale_instantiating_id", 0);
        }), 10000);

      };

      // submit: API
      // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

      this.get("apiCall").postInstance(
        tale.get("_id"),
        tale.get("imageId"),
        null,
        onSuccess,
        onFail);
    }
  }
});
