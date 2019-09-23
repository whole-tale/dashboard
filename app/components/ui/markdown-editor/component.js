// app/pods/components/markdown-component/component.js
import Component from '@ember/component';
import { later } from '@ember/runloop';
import layout from './template';

export default Component.extend({
    layout,

    readonly: false,
    markdownValue: "",

    didInsertElement() {
        $('.menu .item')
          .tab()
        ;

        if (this.get('readonly')) {
            later(function() {
                $('.ui.menu').find('.item').tab('change tab', 'preview');
            },500);
        }

        if(!this.markdownValue) {
            let component = this;
            later(function() {
                component.set('markdownValue', "#### Markdown Editor");
            },1);
        }
    }
});
 
