import Component from '@ember/component';

export default Component.extend({
    model: null,
    classNames: ['tale-tab-files'],
    
    init() {
        this._super(...arguments);
    },
    actions: {
        itemClicked() {
            this.get('itemClicked')();
        },
        refresh() {
            this.get('refresh')();
        },
        breadcrumbClicked() {
            this.get('breadcrumbClicked')();
        },
        navClicked() {
            this.get('navClicked')();
        }
    }
});
