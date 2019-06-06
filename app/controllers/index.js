import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Controller.extend({
  internalState: service('internal-state'),

  init() {
    this._super();
    this.transitionToRoute('browse');
    // this.set('eventStream', this.getEventStream.call(this));
  },

  actions: {
    gotoDataset(name) {
      if (name === "Browser Upload")
        this.transitionToRoute("upload");
      else
        this.transitionToRoute(name.toLowerCase());
    },
    gotoNextcloud(name) {
      this.transitionToRoute("nextcloud");
    },
    gotoSearch(name) {
      this.transitionToRoute("search");
    },
    gotoDrives(name) {
      this.transitionToRoute("upload");
    },
    gotoPublish(name) {
      this.transitionToRoute("compose");
    },
    clickedAddNewResearchEnvironment() {

    },
    clickedRegisterNewDataset() {
      let modal = $('.ui.harvester.modal');
      modal.parent().prependTo($(document.body));
      modal.modal('show');
    },
  }
});
