import Ember from 'ember';
import _ from 'lodash';

export function isChecked(params/*, hash*/) {
  let [aA, key] = params;
  return _.get(aA, `${key}.check`);
}

export default Ember.Helper.helper(isChecked);
