// app/pods/components/markdown-component/component.js
import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,

    markdownValue: "",

    didInsertElement() {
        $('.menu .item')
          .tab()
        ;

        if(!this.markdownValue) {
            let component = this;
            Ember.run.later(function() {
                component.set('markdownValue', "#### Markdown Editor");
            },1);
        }
    }
});
 
