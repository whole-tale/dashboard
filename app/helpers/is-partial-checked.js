import Ember from 'ember';
import _ from 'lodash';

export function isPartialChecked(params/*, hash*/) {
  let [aA, key] = params;
  return _.get(aA, `${key}.partialCheck`);
}

export default Ember.Helper.helper(isPartialChecked);
