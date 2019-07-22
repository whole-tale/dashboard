import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import $ from 'jquery';


export default Component.extend(FullScreenMixin, {
  router: service(),
  currentTab: 'tales',
  
  init() {
    this._super(...arguments);

    let queryParams = this.get('queryParams');
    if (queryParams && queryParams.uri) {
      later(this.actions.openCreateNewTaleModal.bind(this), 100);
    }
  },

  didInsertElement() {
    $('#show-introduction-link').transition('glow');
    $('.ui.dropdown').dropdown({
      action: 'hide',
    });  
  },
  
  actions: {
    transitionToCompose() {
      this.get('router').transitionTo('compose.index');
    },
    selectTab(tabName) {
      this.set('currentTab', tabName);
    },
    showIntroduction() {
      $('#introduction-short').transition('fly up');
      $('#tales-table').addClass('tales-table-long-intro');
      $('#tales-table').removeClass('tales-table-short-intro');
      $('#introduction-long').transition('fly down');
      $('#hide-introduction-link').transition('glow');
    },
    hideIntroduction() {
      $('#introduction-short').transition('fly down');
      $('#tales-table').addClass('tales-table-short-intro');
      $('#tales-table').removeClass('tales-table-long-intro');
      $('#introduction-long').transition('fly up');
      $('#show-introduction-link').transition('glow');
    },
    gotoPublish : function(name) {
      scroll(0,0);
      this.sendAction("gotoPublish", name);
    },

    openCreateNewTaleModal() {
      $('.ui.modal.create-tale').modal('show');
    }
  }

});
