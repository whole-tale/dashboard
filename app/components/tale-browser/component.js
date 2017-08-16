import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  apiCall : Ember.inject.service('api-call'),
  taleInstanceName : "",
  numberOfModels: 0,
  pageNumber: 1,
  totalPages:1,
  leftButtonState: "disabled",
  rightButtonState: "disabled",
  lastAnimationTime : 0,
  animationRefreshTime : 500, // min ms time between animation refreshes
  item : null,
  guid : null,
  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    var modelsPromised = this.get("models");

    var component = this;

    modelsPromised.then(function(models) {
      if (component.get('addButtonName') != null){
        var paginateSize = Number(component.get('paginateOn'));
        component.set('paginateOn', paginateSize);
      }
      component.paginate(component, models);
    });

    this.set('addButtonLogo', '/icons/plus-sign.png');
  },
  didRender() {
    $('.selectable.cards .image').dimmer({
      on: 'hover'
    });
  },
  didUpdate() {

    var guid = this.get('guid');

    if (guid ==null) {
      guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      this.set('guid', guid);
    }

    var d = new Date();
    var milliseconds = d.getTime();
    var lastMSTime = Number(this.get('lastAnimationTime'));


 //   console.log("MS: " + milliseconds );
   // console.log("Last MS: " + lastMSTime);
  //  console.log("Diff: " + (milliseconds-lastMSTime));
    //console.log("GUID: " + guid);

    if (milliseconds-lastMSTime > Number(this.get('animationRefreshTime'))) {
      $('.selectable.cards.' + guid + ' .image img')
        .transition('jiggle')
      ;
      this.set('lastAnimationTime', milliseconds);
    }

  },

  paginate(component, models) {

    var paginateSize = component.get('paginateOn');
    var pageNumber = component.get('pageNumber');
    var arraySize = models.get('length');

    var numberToShow = arraySize % paginateSize;
    var totalPages = arraySize / paginateSize;
    if (numberToShow>0)
      ++totalPages;

  //  console.log(models);
    component.set('numberOfModels', arraySize);

    //console.log("Number of models = " + component.get('numberOfModels'));
    if (models.get('length') === 0) return;

    component.set('totalPages', totalPages);

    //console.log("Paginating on = " + paginateSize);
    //console.log("NumberToShow = " + numberToShow);

    var modelsInView = [];
    var paginateArray = [];

    for (var i=1; i<=totalPages; ++i) {
      if (i==pageNumber)
        paginateArray[i] = {number: i, state: "active"};
      else
        paginateArray[i] = {number: i, state: ""};
    }

    component.set("paginateArray", paginateArray);

    var startingPosition = (pageNumber-1)*paginateSize;
    var endingPosition = ((pageNumber-1)*paginateSize)+paginateSize;
    var iterateNumber=0;

    if (pageNumber == 1)
      component.set('leftButtonState', "disabled");
    else
      component.set('leftButtonState', "");

    if (pageNumber == totalPages)
      component.set('rightButtonState', "disabled");
    else
      component.set('rightButtonState', "");

    models.forEach(function(model){
      if ((iterateNumber>=startingPosition) && (iterateNumber<endingPosition)) {
    //    console.log("Icon field is--" + model.get("icon") + "--");
        if (typeof model.get("icon") === "undefined" ) {
          if (typeof model.get("meta") !== "undefined") {
            var meta = model.get("meta");
      //      console.log("Checking meta fields: " + meta);
            if (meta['provider'] !== "DataONE")
              model['icon'] = "/icons/globus-logo-large.png";
            else
              model['icon'] = "/icons/d1-logo-large.png";
          } else {
            model['icon'] = "/images/whole_tale_logo.png";
          }
        }
        var title = model.get('title');

        var description = model.get('description');

        if ((description == null) ) {
          model.set('tagName', "No Description ...");
        } else {
          if (description.length > 200)
            model.set('tagName', description.substring(0,200) + "..");
          else
            model.set('tagName', description);
        }

        modelsInView.push(model);
      }


      ++iterateNumber;
    });

    component.set("modelsInView", modelsInView);

    //console.log(this.get("modelsInView"));


  },
  actions: {
    leftButtonClicked : function() {
      if (this.get('leftButtonState') === "disabled") return;
      this.set('pageNumber', this.get('pageNumber') -1);
      this.paginate(this, this.get('models'));
    },
    rightButtonClicked : function() {
      if (this.get('rightButtonState') === "disabled") return;
      this.set('pageNumber', this.get('pageNumber') +1);
      this.paginate(this, this.get('models'));
    },
    tabClicked : function(tabNumber) {
      // alert("Clicked " + tabNumber)
      this.set('pageNumber', tabNumber);
      this.paginate(this, this.get('models'));
    },
    searchFilter : function () {
      var searchStr = this.get('searchStr');
    //  console.log(searchStr);

      var modelsPromised = this.get("models");

      var component = this;

      modelsPromised.then(function(models) {
        var searchView = [];
        models.forEach(function(model) {
          var title = model.get('title');

          if (new RegExp(searchStr, "i").test(title))
              searchView.push(model);
        });

        component.paginate(component, searchView);
      });

    },
    select : function (model) {
      this.set('item', model);
      this.sendAction('action', model); // sends to compose.js controller, action itemSelected, based on template spec.
    },

    openDeleteModal: function(id) {
      var selector = '.ui.' + id + '.modal';
      console.log("Selector: " +  selector);
      $(selector).modal('show');
    },

    approveDelete: function(model) {
      console.log("Deleting model " + model.name);
      var component = this;

      model.destroyRecord({ reload: true }).then( function () {
        // refresh
//        component.get('store').findAll('tale', { reload: true }).then(function(tales) {
          component.paginate(component, component.get('models'));
  //      });
      });

      return false;
    },

    denyDelete: function() {
      return true;
    },

    addNew: function() {
        this.sendAction("onAddNew");
    },

    launchTale: function (tale) {
      var component = this;

      component.set("tale_instantiating_id", tale.id);
      component.set("tale_instantiating", true);

      var onSuccess = function(item) {
        console.log(item);
        component.set("tale_instantiating", false);
        component.set("tale_instantiated", true);

        var instance = Ember.Object.create(JSON.parse(item));

        component.set("instance", instance);

        Ember.run.later((function() {
          component.set("tale_instantiated", false);
        }), 30000);
      };

      var onFail = function(item) {
        // deal with the failure here
        component.set("tale_instantiating", false);
        component.set("tale_not_instantiated", true);
        item = JSON.parse(item);

        console.log(item);
        component.set("error_msg", item.message);

        Ember.run.later((function() {
          component.set("tale_not_instantiated", false);
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
    },
  }
});
