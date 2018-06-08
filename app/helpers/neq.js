import Ember from 'ember';

export function neq(params/*, hash*/) {
  let a = params[0];
  let b = params[1];
  return a !== b;
}


export default Ember.Helper.helper(neq);
