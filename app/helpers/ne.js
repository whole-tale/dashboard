import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
  let [a, b] = params;
  return a!==b;
});
