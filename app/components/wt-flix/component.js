import Ember from 'ember';

export default Ember.Component.extend({
  numberOfModels: 0,
  pageNumber: 1,
  totalPages:1,
  leftButtonState: "disabled",
  rightButtonState: "disabled",
  lastAnimationTime : 0,
  animationRefreshTime : 500, // min ms time between animation refreshes
  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    var modelsPromised = this.get("models");

    var component = this;

    modelsPromised.then(function(models) {
      component.paginate(component, models);
    });

  },
  didRender() {
    $('.selectable.cards .image').dimmer({
      on: 'hover'
    });
  },
  didUpdate() {
    var milliseconds = (new Date).getTime();

    if (milliseconds-this.get('lastAnimationTime') > this.get('animationRefreshTime')) {
      $('.selectable.cards .image img')
        .transition('bounce')
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
        var name = model.get('name');

        if (name.length > 20)
          model.set('tagName', name.substring(0,20) + "..");
        else
          model.set('tagName', name);

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
     // console.log(searchStr);

      var modelsPromised = this.get("models");


      var component = this;

      modelsPromised.then(function(models) {
        var searchView = [];

        models.forEach(function(model) {
          var name = model.get('name');

          if (name.indexOf(searchStr) !== -1)
              searchView.push(model);
        });

        component.paginate(component, searchView);
      });

    },
    select : function (model) {
        console.log(model.get('name') + " has been selected")
    }

  }
});
