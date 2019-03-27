import {helper} from '@ember/component/helper';


export default helper(function(params) {
  let [name] = params;
  if (name == null) return "";
  if (name.length > 100)
    name= name.substring(0,100) + "...";

  return name;
});
