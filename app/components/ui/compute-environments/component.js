import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userAuth: Ember.inject.service(),
  apiCall: Ember.inject.service('api-call'),
  internalState: Ember.inject.service(),
  selectedEnvironmentName: "",
  filteredSet: Ember.A(),
  filters: ['All', 'Mine', 'Published', 'Recent'],
  filter: 'All',
  numberOfModels: 0,
  //lastAnimationTime: 0,
  //animationRefreshTime: 500, // min ms time between animation refreshes
  //item: null,
  //guid: null,
  showSearch: true,
  classNameBindings: ['showSearch'],

  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    var models = this.get("models");
    console.log(models);

    var component = this;
    if (typeof models.then === "function") {
      models.then(function (models) {
        models.forEach(function (item) {
          component.get('store').findRecord('image', item.get('id')).then(environment => {
            item.set('environment', environment);
          })
        });
        let environmentCount = models.length;
        console.log(`environment count: ${environmentCount}`);

        component.set('searchView', models);
        component.set('numberOfModels', environmentCount);
        component.updateModels(component, models);
      });
    } else {
      models.forEach(function (item) {
        component.get('store').findRecord('image', item.get('_id')).then(environment => {
          item.set('environment', environment);
        })
      });
      let environmentCount = models.length;
      console.log(`environment count: ${environmentCount}`);

      component.set('searchView', models);
      component.set('numberOfModels', environmentCount);
      component.updateModels(component, models);
    }
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

  actions: {
    onModelChange: function (model) {
      this.sendAction('onLeftModelChange', model); // sends event to parent component
    },

    openDeleteModal: function (id) {
      var selector = '.ui.' + id + '.modal';
      console.log("Selector: " + selector);
      $(selector).modal('show');
    },

    approveDelete: function (model) {
      console.log("Deleting model " + model.name);
      var component = this;

      model.destroyRecord({
        reload: true
      }).then(function () {
        // refresh
        //        component.get('store').findAll('tale', { reload: true }).then(function(tales) {
        // component.paginate(component, component.get('models'));
        //      });
      });

      return false;
    },

    denyDelete: function () {
      return true;
    },

    addNew: function () {
      this.sendAction("onAddNew");
    }

  }
});
