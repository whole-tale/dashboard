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

  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    var models = this.get("models");
    console.log(models);

    var component = this;

    if (typeof models.then === "function") {
      models.then(function (models) {
        models.forEach(function (item) {
          component.get('store').findRecord('tale', item.get('taleId')).then(tale => {
            item.set('tale', tale);
          })
        });
        var paginateSize = Number(component.get('paginateOn'));
        component.set('paginateOn', paginateSize);

        component.set('searchView', models);
        component.paginate(component, models);

      });
    } else {
      models.forEach(function (item) {
        component.get('store').findRecord('tale', item.get('taleId')).then(tale => {
          item.set('tale', tale);
        })
      });
      var paginateSize = Number(component.get('paginateOn'));
      component.set('paginateOn', paginateSize);

      component.set('searchView', models);
      component.paginate(component, models);
    }

    this.set('addButtonLogo', '/icons/plus-sign.png');
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

      var description = model.get('description');

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

    console.log("Models in View!!!");
    console.log(modelsInView);
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

    onModelChange: function (model) {
      //  alert("1");
      this.sendAction('onLeftModelChange', model); // sends evnt to parent component
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
        component.paginate(component, component.get('models'));
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
