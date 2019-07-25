import Component from '@ember/component';
import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
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
    
    instanceObserver: observer('model.instance', function() {
        if (this.model.instance && this.model.instance.status === 0) {
            this.actions.activateInteract.call(this);
        }
    }),
    
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
            later(() => { this.router.transitionTo({ queryParams: { tab: null }}); }, 500);
        } else if (!this.model.instance) {
            this.actions.activateMetadata.call(this);
        }
    },
    
    launchErrorEncountered: observer('taleLaunchError', function() {
        console.log(`taleLaunchError changed: ${this.taleLaunchError}`);
        this.actions.activateInteract.call(this);
    }),

    actions: {
        activateInteract() {
            // Disable this tab when no instance exists
            if (!this.model.instance) { return; }
            
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