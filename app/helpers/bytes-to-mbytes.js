import Ember from 'ember';

export function bytesToMBytes(params/*, hash*/) {
  var bytes = parseInt(params);
  return parseInt(bytes/1048576.0);
}

export default Ember.Helper.helper(bytesToMBytes);
