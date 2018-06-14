import Ember from 'ember';

export function getKey(params/*, hash*/) {
  let [aA, key] = params;
  return aA[key];
}

export default Ember.Helper.helper(getKey);
