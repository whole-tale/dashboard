import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';
// import hasEmberVersion from 'ember-test-helpers/has-ember-version';

export default Component.extend({
    layout,
    classNames: ['tale-tabs-selector'],
    internalState: service(),
    
    activeTabInteract: true,
    activeTabFiles: false,
    activeTabMetadata: false,
    
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