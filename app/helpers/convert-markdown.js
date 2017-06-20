import Ember from 'ember';
import marked from 'npm:marked';

// marked.setOptions({
  // highlight: function (code) {
  //   return Highlight.highlightAuto(code).value;
  // }
// });

export function convertMarkdown(params) {
    let [markdown] = params;
    markdown = markdown ||  "";
    return new Ember.String.htmlSafe(marked(markdown));
}


export default Ember.Helper.helper(convertMarkdown);
