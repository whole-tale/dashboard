import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,

    actions: {
        addTag() {
            if(this.tagName === '') { return; }
            this.tags.push(this.tagName);
            this.set('tagName', '');
            this.set('tags', this.tags.uniq());
        },

        removeTag(tagName) {
            if(tagName === '') { return; }
            this.set('tags', this.tags.filter(t=>t!==tagName));
        }
    }
});