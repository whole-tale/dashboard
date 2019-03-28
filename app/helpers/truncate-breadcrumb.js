import {helper} from '@ember/component/helper';


export default helper(function(params) {
  let [name] = params;
  if (name == null) return "";

  if (name.length > 50)
    name= name.substring(0,50) + "...";

  return name;
});
