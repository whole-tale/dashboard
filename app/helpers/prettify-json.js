import Ember from 'ember';
import JSONBeautify from 'npm:json-beautify';

export default Ember.Helper.helper(function(params) {
  return JSONBeautify(params, null, 2, 80);
});
