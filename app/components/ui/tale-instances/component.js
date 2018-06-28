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

    let models = this.get("models");
    let component = this;

    models.forEach(function (item) {
      component.get('store').findRecord('tale', item.get('taleId')).then(tale => {
        item.set('tale', tale);
      })
    });
    component.set('paginateOn', models.length);
    component.set('searchView', models);
    component.paginate(component, models);
  },
  didRender() {},
  didUpdate() {},

  paginate(component, models) {
    var paginateSize = component.get('paginateOn');
    var pageNumber = component.get('pageNumber');
    var arraySize = models.get('length');

    var totalPages = Math.ceil(arraySize / paginateSize);

    component.set('numberOfModels', arraySize);

    if (models.get('length') === 0) {
      component.set('modelsInView', []);
      component.set('paginateArray', []);
      component.set('rightButtonState', "disabled");
      component.set('lefttButtonState', "disabled");
      component.set('totalPages', 0);
      return;
    }

    component.set('totalPages', totalPages);

    var modelsInView = [];
    var paginateArray = [];

    for (var i = 1; i <= totalPages; ++i) {
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

    if (pageNumber == 1)
      component.set('leftButtonState', "disabled");
    else
      component.set('leftButtonState', "");

    if (pageNumber == totalPages)
      component.set('rightButtonState', "disabled");
    else
      component.set('rightButtonState', "");

    let startIndex = (pageNumber - 1) * paginateSize;
    let endIndex = startIndex + paginateSize;

    for (let i = startIndex; i < endIndex && i < arraySize; i++) {
      let model = models.objectAt(i);
      if (typeof model.get("icon") === "undefined") {
        if (typeof model.get("meta") !== "undefined") {
          var meta = model.get("meta");
          if (meta['provider'] !== "DataONE")
            model['icon'] = "/icons/globus-logo-large.png";
          else
            model['icon'] = "/icons/d1-logo-large.png";
        } else {
          model['icon'] = "/images/whole_tale_logo.png";
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
    }

    component.set("modelsInView", modelsInView);
  },

  actions: {
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
      // alert("Clicked " + tabNumber)
      this.set('pageNumber', tabNumber);
      this.paginate(this, this.get('searchView'));
    },

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
      let selector = '.ui.' + 'delete-modal' + '.modal';
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
        component.set('selectedInstance', undefined);
        component.set('selectedMenuIndex', -1);
        // refresh
        // component.get('store').findAll('tale', { reload: true }).then(function(tales) {
        component.paginate(component, component.get('models'));
        // });
      });
      // TODO refresh the tale browser component
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
      this.get('router').transitionTo('run.view', instance._id);
    }

  }
});
