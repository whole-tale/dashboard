import Component from '@ember/component';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import Object, { observer } from '@ember/object';

export default Component.extend({
  store: service(),
  userAuth: service(),
  router: service(),
  apiCall: service('api-call'),
  internalState: service(),
  wtEvents: service(),

  selectedMenuIndex: -1,
  selectedEnvironment: Object.create({}),
  searchStr: '',
  numberOfModels: 0,
  showSearch: true,
  classNameBindings: ['showSearch'],

  filterObserver: observer('searchStr', function () {
    this.setFilter.call(this);
  }),

  init() {
    this._super(...arguments);
    let models = this.get("models");
    if (!models) {
      models = Promise.resolve([]);
    }

    let url = this.get('router').get('currentURL');
    let id = url.split('/manage/')[1];

    let component = this;
    let updater = function (models) {
      models.forEach(function (item, index) {
        component.get('store').findRecord('image', item.get('id')).then(environment => {
          item.set('environment', environment);
          if (item.get('id') === id) {
            component.set('selectedMenuIndex', index);
            component.set('selectedEnvironment', environment);
          }
        })
      });
      component.set('searchView', models);
      let environmentCount = models.length;
      component.set('numberOfModels', environmentCount);
      component.updateModels(component, models);
    }

    if (typeof models.then === "function") {
      models.then(function (models) {
        updater(models);
      });
    } else {
      updater(models);
    }
  },
  didRender() {},
  didUpdate() {},

  updateModels(component, models) {
    if (!models.get('length')) {
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

    component.set("modelsInView", modelsInView);
  },

  setFilter() {
    this.actions.search.call(this);
  },

  actions: {
    search() {
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
        if(component.get('selectedEnvironment')) {
          let selected = searchView.filter((env, index) => {
            if (env.get('id') === component.get('selectedEnvironment').get('id')) {
              component.set('selectedMenuIndex', index);
            }
            return env.get('id') === component.get('selectedEnvironment').get('id');
          });
          if (!selected.length) {
            component.set('selectedMenuIndex', -1);
          }
        } else {
          component.set('selectedMenuIndex', -1);
        }        
      });
    },

    openDeleteModal(id) {
      let selector = '.ui.' + id + '.modal';
      $(selector).modal('show');
    },

    approveDelete(model) {
      console.log("Deleting model " + model.name);
      let component = this;

      model.destroyRecord({
        reload: true
      }).then(() => component.updateModels(component, component.get('models')));

      return false;
    },

    denyDelete() {
      return true;
    },

    addNew() {
      this.sendAction("onAddNew");
    },
    removeCurrentFilter() {
      this.set('filter', 'All');
      this.setFilter();
    },
    openModal(modalName) {
      let modal = $('.ui.' + modalName + '.modal');
      modal.parent().prependTo($(document.body));
      modal.modal('show');
    },
    openDetailsModal(model) {
      let component = this;
      if (model) {
        model.set('configuration', JSON.stringify(model.get('config'), null, 2));
        let creatorId = model.get('creatorId');
        let creator = model.get('store').findRecord('user', creatorId).then(user => {
          model.set('creator', user);
          component.set('detailsModel', model);
          $('.ui.modal.envdetails').modal('show');
        });
      }
    },
    selectEnvironment(model, index) {
      let component = this;
      if (this.get('isComposing')) {
        component.set('selectedEnvironment', model);
        component.set('selectedMenuIndex', index);
        component.get('wtEvents').events.selectEnvironment(this.get('selectedEnvironment'));
      } else {
        component.get('router').transitionTo('manage.view', model.get('id'));
      }
    },
    deselectEnvironment() {
      let component = this;
      component.set('selectedEnvironment', Ember.Object.create({}));
      component.set('selectedMenuIndex', -1);
      component.get('wtEvents').events.selectEnvironment(this.get('selectedEnvironment'));
      // component.get('router')
      component.get('router').transitionTo('manage.index');
    }
  }
});
