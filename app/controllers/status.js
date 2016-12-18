import Ember from 'ember';
var inject = Ember.inject;

export default Ember.Controller.extend({
  internalState: inject.service(),

  init() {
 //   this.get('internalState').setCurrentFileBreadcrumbs(["anID", "anID2"]);

    console.log("The value saved as ");
    console.log(this.get('internalState').getCurrentFileBreadcrumbs());

  },
  actions: {
    textUpdated: function(newVal) {
      var val = this.get("example");
      console.log(val);
    }
    },


});
