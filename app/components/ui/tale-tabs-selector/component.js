import Component from '@ember/component';
import layout from './template';

export default Component.extend({
    layout,
    classNames: ['tale-tabs-selector'],
    init() {
        this._super(...arguments);

        this.set("activeTabInteract", true);
        this.set("activeTabFiles", false);
        this.set("activeTabMetadata", false);
    },

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
    }
});