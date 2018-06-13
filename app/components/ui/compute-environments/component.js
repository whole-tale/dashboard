import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userAuth: Ember.inject.service(),
  apiCall: Ember.inject.service('api-call'),
  internalState: Ember.inject.service(),
  selectedEnvironmentName: "",
  filteredSet: Ember.A(),
  searchStr: '',
  numberOfModels: 0,
  showSearch: true,
  classNameBindings: ['showSearch'],

  filterObserver: Ember.observer('searchStr', function () {
    this.setFilter.call(this);
  }),

  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    let models = this.get("models");
    console.log(models);

    if (!models) {
      models = Promise.resolve([]);
    }

    let component = this;
    models.then(function (models) {
      models.forEach(function (item) {
        component.get('store').findRecord('image', item.get('id')).then(environment => {
          item.set('environment', environment);
        })
      });
      component.set('searchView', models);
      let environmentCount = models.length;
      component.set('numberOfModels', environmentCount);
      component.updateModels(component, models);
    });
  },
  didRender() {},
  didUpdate() {
    console.log('environments length just changed!');
  },

  updateModels(component, models) {
    if (models.get('length') === 0) {
      component.set('modelsInView', []);
    }
    let modelsInView = [];

    for (let i = 0; i < component.numberOfModels; i++) {
      let model = models.objectAt(i);
      if (!model.get("icon")) {
        model['icon'] = "/images/frontends/rstudio.png";
      }

      let description = model.get('description');

      if (!description) {
        model.set('tags', "No Description ...");
      } else {
        if (description.length > 200)
          model.set('tags', description.substring(0, 200) + "..");
        else
          model.set('tags', description);
      }

      modelsInView.push(model);
    }

    console.log("Models in Environments View are ready!!!");
    console.log(modelsInView);
    component.set("modelsInView", modelsInView);
  },

  setFilter() { 
    const filter = this.get('searchStr');
    const models = this.get('models');
    this.set('filteredSet', models);
    this.actions.searchFilter.call(this);
  },

  actions: {
    searchFilter: function () {
      let searchStr = this.get('searchStr');
      const filteredSet = this.get('filteredSet');
      const component = this;

      let promise = new Ember.RSVP.Promise((resolve) => {
        let searchView = [];
        filteredSet.forEach(model => {
          let name = model.get('name');
          if (new RegExp(searchStr, "i").test(name)) {
            searchView.push(model);
          }
        });
        resolve(searchView);
      });

      promise.then((searchView) => {
        component.set('modelsInView', searchView);
        component.updateModels(component, searchView);
      });
    },
    onModelChange: function (model) {
      this.sendAction('onLeftModelChange', model); // sends event to parent component
    },

    openDeleteModal: function (id) {
      let selector = '.ui.' + id + '.modal';
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
        // refresh
        component.updateModels(component, component.get('models'));
      });

      return false;
    },

    denyDelete: function () {
      return true;
    },

    addNew: function () {
      this.sendAction("onAddNew");
    },
    removeCurrentFilter: function() {
      this.set('filter', 'All');
      this.setFilter();
    }

  }
});
