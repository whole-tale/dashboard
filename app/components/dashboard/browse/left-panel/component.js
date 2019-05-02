import Component from '@ember/component';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import $ from 'jquery';


export default Component.extend(FullScreenMixin, {

  currentTab: 'tales',
  
  didInsertElement() {
    $('#show-introduction-link').transition('glow');
  },
  
  actions: {
    selectTab(tabName) {
      this.set('currentTab', tabName);
    },
    showIntroduction() {
      $('#dashboard-brand-header').transition('fly up');
      $('#introduction-short').transition('fly up');
      $('#introduction-long').transition('fly down');
      $('#hide-introduction-link').transition('glow');
    },
    hideIntroduction() {
      $('#dashboard-brand-header').transition('fly down');
      $('#introduction-short').transition('fly down');
      $('#introduction-long').transition('fly up');
      $('#show-introduction-link').transition('glow');
    },
    gotoPublish : function(name) {
      scroll(0,0);
      this.sendAction("gotoPublish", name);
    },
  }

});
