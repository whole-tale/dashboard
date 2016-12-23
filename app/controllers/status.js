import Ember from 'ember';
var inject = Ember.inject;

export default Ember.Controller.extend({
  internalState: inject.service(),
  body : "Enter description here ...",
  mediumEditorOptions: {
    "toolbar": {
      "buttons": ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote', 'unorderedlist', 'orderedlist'],
    },
    "checkLinkFormat": true,
    "forcePlainText": true
  },
  init() {
    // testing
    this.get('internalState').setCurrentFileBreadcrumbs(["anID", "anID2"]);

    console.log("The value saved as ");
    console.log(this.get('internalState').getCurrentFileBreadcrumbs());


  },
  actions: {
    textUpdated: function(newVal) {
      var val = this.get("body");
      console.log(val);
    }
    },


});
