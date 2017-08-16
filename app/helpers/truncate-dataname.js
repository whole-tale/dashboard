import Ember from 'ember';
import moment from 'moment';


export default Ember.Helper.helper(function(params) {
  let [name] = params;
  if (name == null) return "";
  if (name.length > 100)
    name= name.substring(0,100) + "...";

  return name;
});
