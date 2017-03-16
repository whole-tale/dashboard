import Ember from 'ember';

export default Ember.Component.extend({
  numberOfModels: 0,
  pageNumber: 1,
  totalPages:1,
  leftButtonState: "disabled",
  rightButtonState: "disabled",

  init() {
    this._super(...arguments);
    console.log("Attributes updated");

    var modelsPromised = this.get("models");

    var component = this;

    modelsPromised.then(function(models) {
      component.paginate(component, models);
    });
  },
  paginate(component, models) {

    var paginateSize = component.get('paginateOn');
    var pageNumber = component.get('pageNumber');
    var arraySize = models.get('length');

    var numberToShow = arraySize % paginateSize;
    var totalPages = arraySize / paginateSize;
    if (numberToShow>0)
      ++totalPages;

    console.log(models);
    component.set('numberOfModels', arraySize);

    console.log("Number of models = " + component.get('numberOfModels'));

    if (models.get('length') == 0) return;

    component.set('totalPages', totalPages);

    console.log("Paginating on = " + paginateSize);
    console.log("NumberToShow = " + numberToShow);

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
    models.forEach(function(model){

      if ((iterateNumber>=startingPosition) && (iterateNumber<endingPosition)) {
        modelsInView.push(model)
      }
      ++iterateNumber;
    });

    component.set("modelsInView", modelsInView);

    console.log(this.get("modelsInView"));


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
    }

  }
});
