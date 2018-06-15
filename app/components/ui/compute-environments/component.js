import Ember from 'ember';

const service = Ember.inject.service.bind(Ember);

export default Ember.Component.extend({
  store: service(),
  userAuth: service(),
  apiCall: service('api-call'),
  internalState: service(),
  wtEvents: service(),
  
  selectedMenuIndex: -1,
  selectedEnvironment: Ember.Object.create({}),
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
    console.log('environments length just changed to: ' + this.get('modelsInView').length);
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
    this.actions.search.call(this);
  },

  actions: {
    search: function () {
      let searchStr = this.get('searchStr').trim();
      const models = this.get('models');
      const component = this;

      let promise = new Ember.RSVP.Promise((resolve) => {
        let searchView = [];
        models.forEach(model => {
          let name = model.get('name');
          //  if (new RegExp(searchStr, "i").test(name))
          if(~name.toLowerCase().indexOf(searchStr.toLowerCase())) {
            searchView.push(model);
          }
        });
        resolve(searchView);
      });

      promise.then((searchView) => {
        component.set('modelsInView', searchView);
        let selected = searchView.filter((env,i) => {
          if(env.id === component.get('selectedEnvironment').id) {
            component.set('selectedMenuIndex', i);
          }
          return env.id === component.get('selectedEnvironment').id;
        });
        if(!selected.length) {
          component.set('selectedMenuIndex', -1);
          // component.set('selectedEnvironment', Ember.Object.create({}));
          // component.get('wtEvents').events.selectEnvironment(this.get('selectedEnvironment'));
        }
        // component.updateModels(component, searchView);
      });
    },
    onModelChange: function (model, index) {
      // this.sendAction('onLeftModelChange', model); // sends event to parent component
      this.set('selectedEnvironment', model);
      this.set('selectedMenuIndex', index);
      this.get('wtEvents').events.selectEnvironment(this.get('selectedEnvironment'));
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
    removeCurrentFilter: function () {
      this.set('filter', 'All');
      this.setFilter();
    },
    openModal: function (modalName) {
      let modal = Ember.$('.ui.' + modalName + '.modal');
      modal.parent().prependTo(Ember.$(document.body));
      modal.modal('show');
    },
    openDetailsModal: function (model) {
      this.set('detailsModel', model);
      console.log('attempting to open details modal');
      Ember.$('.ui.modal.envdetails').modal('show');
    },
    selectEnvironment: function(model, index) {
      let component = this;
      component.set('selectedEnvironment', model);
      component.set('selectedMenuIndex', index);
      component.get('wtEvents').events.selectEnvironment(this.get('selectedEnvironment'));
      console.log('selected environment: ' + model.name);
    }
  }
});
