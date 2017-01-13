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
    this._super();
    // testing
    this.get('internalState').setCurrentFileBreadcrumbs(["anID", "anID2"]);

    console.log("The value saved as ");
    console.log(this.get('internalState').getCurrentFileBreadcrumbs());

  },
  didInsertElement() {
    alert("Grider Cookie is " + document.girderToken);
  },

  actions: {
    textUpdated: function(newVal) {
      var val = this.get("body");
      console.log(val);
    }
    },


});
