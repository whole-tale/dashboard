import Ember from 'ember';

export default Ember.Controller.extend({
  newUIMode : true,
  internalState: Ember.inject.service('internal-state'),

  init() {
    this._super();

    var uiMode = this.get('internalState').getNewUIMode();
    this.set("newUIMode", uiMode);

    if (uiMode)
      this.transitionToRoute("browse");

    // this.set('eventStream', this.getEventStream.call(this));
  },

  actions: {
    gotoDataset : function(name) {
      if (name === "Browser Upload")
        this.transitionToRoute("upload");
      else
        this.transitionToRoute(name.toLowerCase());
    },
    gotoNextcloud: function(name) {
        this.transitionToRoute("nextcloud");
    },
    gotoSearch : function(name) {
        this.transitionToRoute("search");
    },
    gotoDrives : function(name) {
        this.transitionToRoute("upload");
    },
    gotoPublish : function(name) {
        this.transitionToRoute("compose");
    },
    clickedAddNewResearchEnvironment() {

    },
    clickedRegisterNewDataset() {
        let modal = Ember.$('.ui.harvester.modal');
        modal.parent().prependTo(Ember.$(document.body));
        modal.modal('show');
    }
  },
});
