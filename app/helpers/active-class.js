import Ember from 'ember';

export function activeClass(params/*, hash*/) {
  const index = params[0];
  const active = params[1];
  
  return (index === active) ? 'active-class': '';
}

export default Ember.Helper.helper(activeClass);