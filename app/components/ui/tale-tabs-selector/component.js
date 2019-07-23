import Component from '@ember/component';
import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from './template';
// import hasEmberVersion from 'ember-test-helpers/has-ember-version';

export default Component.extend({
    layout,
    classNames: ['tale-tabs-selector'],
    internalState: service(),
    routing: service('-routing'),
    router: service(),
    params: alias('routing.router.currentState.routerJsState.fullQueryParams'),
    
    activeTabInteract: true,
    activeTabFiles: false,
    activeTabMetadata: false,
    
    init() {
        this._super(...arguments);
        
        // If a "tab" querystring param is specified, consume it
        if (this.params['tab']) {
            let queryTab = this.params['tab'];
            if (queryTab === 'interact') {
                this.actions.activateInteract.call(this);
            } else if (queryTab === 'files') {
                this.actions.activateFiles.call(this);
            } else if (queryTab === 'metadata') {
                this.actions.activateMetadata.call(this);
            }
            
            // Clear the querystring parameter after it is consumed
            this.router.transitionTo({ queryParams: { tab: null }});
        }
    },
    
    launchErrorEncountered: observer('taleLaunchError', function() {
        console.log(`taleLaunchError changed: ${this.taleLaunchError}`);
        this.actions.activateInteract.call(this);
    }),

    actions: {
        activateInteract() {
            this.set("activeTabInteract", true);
            this.set("activeTabFiles", false);
            this.set("activeTabMetadata", false);
        },
        activateFiles() {
            this.set("activeTabInteract", false);
            this.set("activeTabFiles", true);
            this.set("activeTabMetadata", false);
        },
        activateMetadata() {
            this.set("activeTabInteract", false);
            this.set("activeTabFiles", false);
            this.set("activeTabMetadata", true);
        },
        openSelectDataModal() {
            this.sendAction('openSelectDataModal');
        }
    }
});