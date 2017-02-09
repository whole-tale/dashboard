import Ember from 'ember';
import moment from 'moment';


export default Ember.Helper.helper(function(params) {
  let [date] = params;
  return moment(new Date(date)).fromNow();
});
