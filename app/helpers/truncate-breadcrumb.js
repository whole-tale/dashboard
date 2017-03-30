import Ember from 'ember';
import moment from 'moment';


export default Ember.Helper.helper(function(params) {
  let [name] = params;
  if (name == null) return "";

  if (name.length > 50)
    name= name.substring(0,50) + "...";

  return name;
});
