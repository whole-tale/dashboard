import Ember from 'ember';
import moment from 'moment';


export default Ember.Helper.helper(function(params) {
  let [name] = params;
  if (name.length > 80)
    name= name.substring(0,80) + "...";

  return name;
});
