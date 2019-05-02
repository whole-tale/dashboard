import Component from '@ember/component';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import $ from 'jquery';


export default Component.extend(FullScreenMixin, {

  currentTab: 'tales',
  
  actions: {
    selectTab(tabName) {
      this.set('currentTab', tabName);
    },
    showIntroduction() {
      $('#introduction-short').transition('slide up');
      $('#introduction-long').transition('slide down');
    },
    hideIntroduction() {
      $('#introduction-short').transition('slide up');
      $('#introduction-long').transition('slide down');
    },
    gotoPublish : function(name) {
      scroll(0,0);
      this.sendAction("gotoPublish", name);
    },
  }

});
