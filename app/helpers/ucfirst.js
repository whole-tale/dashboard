import Ember from 'ember';

export function ucfirst(params/*, hash*/) {
  return params.charAt(0).toUpperCase() + params.slice(1);
}

export default Ember.Helper.helper(ucfirst);
